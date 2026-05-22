import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { profile, job } = await req.json();

    if (!profile || !job) {
      throw new Error("Missing profile or job data");
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
       console.log("No Gemini API key found, returning mock data");
       return new Response(
        JSON.stringify({ 
          success: true, 
          coverLetter: `Dear Hiring Manager at ${job.company_name},\n\nI am writing to express my interest in the ${job.title} position. With my background in ${profile.field_of_study} and ${profile.years_of_experience} years of experience, I am confident in my ability to contribute to your team.\n\nThank you for your time.\n\nBest regards,\n${profile.full_name}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Write a professional cover letter for the following candidate applying to the following job.
    Keep it concise (3 paragraphs max), professional, and highlight how the candidate's skills match the job requirements.
    
    CANDIDATE PROFILE:
    Name: ${profile.full_name}
    Experience: ${profile.years_of_experience} years
    Qualification: ${profile.highest_qualification} in ${profile.field_of_study}
    Skills: ${profile.skills?.join(', ') || 'Various'}
    
    JOB DESCRIPTION:
    Title: ${job.title}
    Company: ${job.company_name || 'the company'}
    Requirements: ${job.required_experience} years experience, ${job.required_qualification}
    Description: ${job.description}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    });

    const data = await response.json();
    const coverLetter = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ success: true, coverLetter }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
