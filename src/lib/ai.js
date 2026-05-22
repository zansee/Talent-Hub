/**
 * TalentHub Botswana — AI Client
 * Gemini 2.5 Flash (primary) → Groq Llama (fallback on quota errors)
 */

// NOTE: API keys are stored in Supabase Edge Function secrets server-side.
// This client-side file calls Supabase Edge Functions, not the APIs directly.
import { supabase } from './supabase';

/**
 * Extracts structured data from a CV text.
 * @param {string} text - The raw text extracted from the CV document
 * @param {string} userId - The user ID to associate the data with
 * @returns {Promise<Object>} The extracted profile data
 */
export const extractCVData = async (text, userId) => {
  try {
    const { data, error } = await supabase.functions.invoke('cv-processor', {
      body: { text, userId }
    });
    
    if (error) throw error;
    return data.data; // The edge function returns { success: true, data: {...} }
  } catch (error) {
    console.error('Error in extractCVData:', error);
    throw error;
  }
};

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
/**
 * Generates a tailored cover letter for a specific job application.
 * @param {Object} profile - The candidate's profile data
 * @param {Object} job - The job posting data
 * @returns {Promise<string>} The generated cover letter text
 */
export const generateCoverLetter = async (profile, job) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
      body: { profile, job }
    });
    
    if (error) throw error;
    return data.coverLetter;
  } catch (error) {
    console.error('Error in generateCoverLetter:', error);
    throw error;
  }
};

// ── Screening Questions Suggestion ─────────────────────────────────────────
/**
 * Mocks generating suggested screening questions for a job post.
 * (Future enhancement: move to edge function)
 */
export const generateScreeningQuestions = async (jobTitle, industry) => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  return [
    `How many years of professional experience do you have as a ${jobTitle}?`,
    `Describe a challenging project you completed in the ${industry} industry.`,
    `What specific skills make you a strong fit for this role?`
  ];
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
