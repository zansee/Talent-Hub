import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    
    // Check if this is a webhook from the jobs table (insert)
    if (payload.type === 'INSERT' && payload.table === 'jobs') {
      const job = payload.record;
      
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Find candidates matching the job's industry and location
      const { data: candidates, error } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name, onesignal_id')
        .eq('role', 'job_seeker')
        .eq('industry', job.industry);

      if (error) throw error;
      if (!candidates || candidates.length === 0) return new Response('No matching candidates found', { status: 200 });

      // Insert notifications into our database
      const notifications = candidates.map(c => ({
        user_id: c.id,
        type: 'job_match',
        title: 'New Job Match!',
        body: `A new ${job.title} role at ${job.company_name || 'a great company'} matches your profile.`,
        related_id: job.id
      }));

      await supabaseClient.from('notifications').insert(notifications);

      // Send Push Notifications via OneSignal
      const onesignalAppId = '65e7fb40-66af-4043-956a-e06c0d4c7a3c';
      const onesignalApiKey = Deno.env.get('ONESIGNAL_API_KEY');

      if (onesignalApiKey) {
        const targetExternalIds = candidates.map(c => c.id);
        
        await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Basic ${onesignalApiKey}`
          },
          body: JSON.stringify({
            app_id: onesignalAppId,
            include_external_user_ids: targetExternalIds,
            channel_for_external_user_ids: 'push',
            headings: { en: 'New Job Match!' },
            contents: { en: `A new ${job.title} role matches your profile.` },
            data: { route: `/mobile/feed` }
          })
        });
      }

      return new Response(JSON.stringify({ success: true, notifiedCount: candidates.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Not an insert event on jobs table', { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
});
