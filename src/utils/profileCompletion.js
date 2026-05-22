/**
 * TalentHub Botswana — Profile Completion Calculator
 * Returns a number 0-100 based on filled profile fields
 */

export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const checks = [
    // Core identity (30%)
    { field: profile.full_name, weight: 5 },
    { field: profile.phone, weight: 5 },
    { field: profile.location, weight: 5 },
    { field: profile.avatar_url, weight: 5 },

    // Education (20%)
    { field: profile.highest_qualification, weight: 10 },
    { field: profile.field_of_study, weight: 5 },
    { field: profile.institution_name, weight: 5 },

    // Work (30%)
    { field: profile.years_of_experience, weight: 10 },
    { field: profile.current_job_title, weight: 10 },
    { field: profile.preferred_industries?.length > 0, weight: 5 },
    { field: profile.skills?.length > 0, weight: 5 },

    // CV (20%)
    { field: profile.cv_url, weight: 15 },
    { field: profile.cv_score, weight: 5 },
  ];

  return checks.reduce((total, check) => {
    return total + (check.field ? check.weight : 0);
  }, 0);
};

/**
 * Returns checklist items for the onboarding checklist display
 */
export const getChecklistItems = (profile) => {
  return [
    {
      key: 'account_created',
      label: 'Account Created',
      done: true,
      points: 10,
    },
    {
      key: 'profile_setup',
      label: 'Profile Setup Complete',
      done: !!profile?.onboarding_completed,
      points: 30,
    },
    {
      key: 'cv_uploaded',
      label: 'CV Uploaded & Scored',
      done: !!profile?.cv_url,
      points: 40,
    },
    {
      key: 'first_swipe',
      label: 'First Job Swiped',
      done: !!profile?.onboarding_checklist?.first_swipe,
      points: 10,
    },
    {
      key: 'referral_shared',
      label: 'Referred a Friend',
      done: !!profile?.onboarding_checklist?.referral_shared,
      points: 10,
    },
  ];
};
