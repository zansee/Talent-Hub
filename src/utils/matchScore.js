/**
 * Calculates the match score (0-100) between a user profile and a job listing
 * based on TalentHub Botswana's matching criteria:
 * - Preferred Industry: 15%
 * - Skills Match: 10%
 * - Qualifications: 25%
 * - Experience Range: 30%
 * - Field of Study: 20%
 * - Location: 0% (displayed contextually)
 */

const qualificationHierarchy = {
  'none': 0,
  'Junior Certificate (JC)': 1,
  'BGCSE': 2,
  'Diploma / Associate Degree': 3,
  "Bachelor's Degree": 4,
  "Master's Degree": 5,
  'PhD / Doctorate': 6,
  'Professional Certifications': 7
};

export const calculateMatchScore = (job, profile) => {
  if (!job || !profile) return 0;

  let score = 0;

  // 1. Preferred Industry (15%)
  if (profile.preferred_industries && profile.preferred_industries.includes(job.industry)) {
    score += 15;
  }

  // 2. Skills Match (10%)
  if (job.required_skills && job.required_skills.length > 0) {
    const jobSkills = job.required_skills.map(s => s.toLowerCase());
    const profileSkills = (profile.skills || []).map(s => s.toLowerCase());
    
    const matchingSkills = jobSkills.filter(s => profileSkills.includes(s));
    const skillRatio = matchingSkills.length / jobSkills.length;
    score += Math.round(skillRatio * 10);
  } else {
    // If no required skills are posted on the job, candidate gets full skill points
    score += 10;
  }

  // 3. Qualifications (25%)
  const jobQualRank = qualificationHierarchy[job.required_qualification] || 0;
  const profileQualRank = qualificationHierarchy[profile.highest_qualification] || 0;
  
  if (profileQualRank >= jobQualRank) {
    score += 25;
  } else if (profileQualRank > 0 && profileQualRank >= jobQualRank - 1) {
    // Partial match if candidate is only 1 level below
    score += 12;
  }

  // 4. Experience Range (30%)
  // Experience ranges: '0-2', '3-5', '6-9', '10+'
  const expLevels = ['0-2', '3-5', '6-9', '10+'];
  const jobExpIndex = expLevels.indexOf(job.required_experience);
  const profileExpIndex = expLevels.indexOf(profile.years_of_experience);

  if (jobExpIndex !== -1 && profileExpIndex !== -1) {
    if (profileExpIndex >= jobExpIndex) {
      // Meets or exceeds required experience
      score += 30;
    } else if (profileExpIndex === jobExpIndex - 1) {
      // 1 tier below, get half points
      score += 15;
    }
  } else {
    score += 30; // Fallback
  }

  // 5. Field of Study (20%)
  if (job.field_of_study && profile.field_of_study) {
    const jobField = job.field_of_study.toLowerCase().trim();
    const profileField = profile.field_of_study.toLowerCase().trim();
    
    if (jobField === profileField || profileField.includes(jobField) || jobField.includes(profileField)) {
      score += 20;
    } else {
      // Check partial words overlap
      const jobWords = jobField.split(/\s+/);
      const profileWords = profileField.split(/\s+/);
      const overlap = jobWords.filter(w => w.length > 3 && profileWords.includes(w));
      if (overlap.length > 0) {
        score += 10;
      }
    }
  } else if (!job.field_of_study) {
    score += 20; // If job doesn't specify field of study, full match
  }

  return Math.min(100, Math.max(0, score));
};

export default calculateMatchScore;
