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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { text, userId } = await req.json();

    if (!text || !userId) {
      throw new Error("Missing CV text or userId");
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
       console.log("No Gemini API key found, returning mock data");
       return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Mock extraction successful (No Gemini key)",
          data: {
             skills: ["JavaScript", "React", "Node.js"],
             years_of_experience: 3,
             highest_qualification: "Bachelor's Degree",
             field_of_study: "Computer Science"
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Extract the following details from this CV text as a JSON object:
    - skills (array of strings)
    - years_of_experience (number, estimate if needed)
    - highest_qualification (string, e.g. "Bachelor's Degree", "Diploma")
    - field_of_study (string)
    
    CV TEXT:
    ${text.substring(0, 5000)}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    const extractedText = data.candidates[0].content.parts[0].text;
    const extractedData = JSON.parse(extractedText);

    // Update profile with extracted data
    await supabaseClient
      .from('profiles')
      .update(extractedData)
      .eq('id', userId);

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
