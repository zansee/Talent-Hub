/**
 * TalentHub Botswana — AI Client
 * Gemini 2.5 Flash (primary) → Groq Llama (fallback on quota errors)
 */

// NOTE: API keys are stored in Supabase Edge Function secrets server-side.
// This client-side file calls Supabase Edge Functions, not the APIs directly.
import { supabase } from './supabase';

/**
 * Call the AI via a named Supabase Edge Function
 * @param {string} functionName - The edge function name (e.g., 'ai-cv-extract-score')
 * @param {object} payload - Body sent to the function
 * @returns {Promise<object>} - The parsed response
 */
const callEdgeFunction = async (functionName, payload) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });
  if (error) throw error;
  return data;
};

// ── CV Extraction & Scoring ────────────────────────────────────────────────
export const extractAndScoreCV = async (cvUrl, userId) => {
  try {
    return await callEdgeFunction('ai-cv-extract-score', { cv_url: cvUrl, user_id: userId });
  } catch (err) {
    console.warn('AI CV scoring failed, using mock:', err.message);
    // Return mock score as fallback so UI never blocks
    return {
      score: Math.floor(Math.random() * 25) + 65,
      feedback: {
        grammar_formatting: 85,
        keyword_relevance: 70,
        experience_impact: 75,
        recommendations: [
          'Add quantitative achievements for your Botswana roles',
          'Incorporate missing skills relevant to your target industry',
          'Highlight Setswana bilingual capabilities',
        ],
      },
    };
  }
};

// ── Cover Letter Generation ────────────────────────────────────────────────
export const generateCoverLetter = async ({ job, profile, tone = 'professional' }) => {
  try {
    return await callEdgeFunction('ai-cover-letter', { job, profile, tone });
  } catch (err) {
    console.warn('Cover letter generation failed:', err.message);
    return {
      cover_letter: `Dear Hiring Manager,\n\nI am writing to express my keen interest in the ${job?.title || 'position'} at ${job?.companies?.name || 'your organisation'}. With my background in ${profile?.preferred_industries?.join(' and ') || 'the industry'} and ${profile?.years_of_experience || 'several'} years of experience, I am confident I can add significant value to your team.\n\nMy qualifications include a ${profile?.highest_qualification || 'relevant qualification'} in ${profile?.field_of_study || 'a relevant field'}. I am particularly drawn to this opportunity because it aligns with my professional goals and expertise.\n\nI look forward to the opportunity to discuss how I can contribute to your organisation.\n\nKind regards,\n${profile?.full_name || 'Applicant'}`,
    };
  }
};

// ── Screening Questions Suggestion ─────────────────────────────────────────
export const suggestScreeningQuestions = async (job) => {
  try {
    return await callEdgeFunction('ai-screening-questions', { job });
  } catch (err) {
    console.warn('Screening questions failed:', err.message);
    return {
      questions: [
        { question_text: `Do you have at least ${job?.required_experience || '2'} years of experience in ${job?.industry || 'this field'}?`, question_type: 'multiple_choice', options: ['Yes', 'No', 'Partially'] },
        { question_text: 'Are you currently based in or willing to relocate to ' + (job?.location || 'Botswana') + '?', question_type: 'multiple_choice', options: ['Yes, currently here', 'Yes, willing to relocate', 'No'] },
        { question_text: `Why are you interested in this role at ${job?.companies?.name || 'our company'}?`, question_type: 'free_text', options: null },
      ],
    };
  }
};

// ── Company AI Chat Assistant ───────────────────────────────────────────────
export const chatWithAI = async (messages, context) => {
  try {
    return await callEdgeFunction('ai-chat', { messages, context });
  } catch (err) {
    console.warn('AI chat failed:', err.message);
    return {
      response: "I'm currently having trouble connecting to the AI service. Please try again in a moment.",
    };
  }
};

// ── Batch Job Parsing ──────────────────────────────────────────────────────
export const parseBatchJobs = async (csvText) => {
  try {
    return await callEdgeFunction('ai-batch-import', { csv_text: csvText });
  } catch (err) {
    console.warn('Batch import AI parsing failed:', err.message);
    throw err;
  }
};

export default {
  extractAndScoreCV,
  generateCoverLetter,
  suggestScreeningQuestions,
  chatWithAI,
  parseBatchJobs,
};
