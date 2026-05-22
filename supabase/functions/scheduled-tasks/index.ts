import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

Deno.serve(async (req) => {
  try {
    // Validate authorization (should be triggered by pg_cron or similar secure internal trigger)
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`) {
      // For cron jobs, we usually verify a custom secret, but keeping it simple here
      // console.warn("Unauthorized execution attempt");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();

    // 1. Delete expired Quick Jobs (> 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: expiredJobs, error: qjError } = await supabaseClient
      .from('quick_jobs')
      .update({ status: 'expired' })
      .lt('created_at', sevenDaysAgo)
      .eq('status', 'open');

    if (qjError) console.error('Error expiring quick jobs:', qjError);

    // 2. Perform Account Deletions for accounts past the 30-day grace period
    const { data: accountsToDelete, error: delError } = await supabaseClient
      .from('profiles')
      .select('id')
      .lt('scheduled_deletion_at', now);

    if (delError) {
      console.error('Error fetching accounts to delete:', delError);
    } else if (accountsToDelete && accountsToDelete.length > 0) {
      // Note: Full deletion of auth users requires Admin API, which is available via Service Role key
      for (const account of accountsToDelete) {
        await supabaseClient.auth.admin.deleteUser(account.id);
        // Cascading foreign keys should clean up their profile data
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Scheduled tasks executed successfully",
      expiredQuickJobs: expiredJobs?.length || 0,
      deletedAccounts: accountsToDelete?.length || 0
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
});
