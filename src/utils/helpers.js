/**
 * TalentHub Botswana — General Helpers
 */

// Generate a random referral code
export const generateReferralCode = () =>
  'TH-' + Math.random().toString(36).substring(2, 8).toUpperCase();

// Generate a public job token (16 hex chars)
export const generatePublicToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

// Debounce helper
export const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

// Deep clone (for form data)
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Parse salary from string "5000-8000" or "8000"
export const parseSalary = (str) => {
  if (!str) return { min: null, max: null };
  const parts = str.split('-').map((p) => parseFloat(p.trim()));
  if (parts.length === 2) return { min: parts[0], max: parts[1] };
  return { min: parts[0], max: parts[0] };
};

// Badge colour helper based on match score
export const matchScoreColor = (score) => {
  if (score >= 80) return { text: 'text-green-400', border: 'border-green-500', bg: 'bg-green-500/10' };
  if (score >= 60) return { text: 'text-primary', border: 'border-primary', bg: 'bg-primary/10' };
  return { text: 'text-orange-400', border: 'border-orange-500', bg: 'bg-orange-500/10' };
};

// Application status helpers
export const statusConfig = {
  applied: { label: 'Applied', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  reviewed: { label: 'Under Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  shortlisted: { label: 'Shortlisted', color: 'text-primary', bg: 'bg-primary/10 border-primary/30' },
  interviewed: { label: 'Interviewed', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  offer: { label: 'Offer Received', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  rejected: { label: 'Not Selected', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  withdrawn: { label: 'Withdrawn', color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/30' },
};

// Pipeline stage labels (for company kanban)
export const pipelineStageConfig = {
  applied: { label: 'Applied', bg: 'bg-blue-900/30', border: 'border-blue-800' },
  reviewed: { label: 'Reviewing', bg: 'bg-yellow-900/30', border: 'border-yellow-800' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-primary/20', border: 'border-primary/40' },
  interviewed: { label: 'Interviewed', bg: 'bg-purple-900/30', border: 'border-purple-800' },
  offer: { label: 'Offer Sent', bg: 'bg-green-900/30', border: 'border-green-800' },
  rejected: { label: 'Rejected', bg: 'bg-red-900/30', border: 'border-red-800' },
};

// Sort array of objects by key
export const sortBy = (arr, key, direction = 'asc') => {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Group array by key
export const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const group = item[key] || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
};
