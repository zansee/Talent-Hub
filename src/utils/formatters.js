/**
 * TalentHub Botswana — Formatting Utilities
 * Botswana currency (BWP / Pula), dates in Africa/Gaborone timezone
 */

// Format a number as Botswana Pula
export const formatBWP = (amount) => {
  if (!amount && amount !== 0) return 'P —';
  return `P ${Number(amount).toLocaleString('en-BW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Format a salary range: P 5,000 – P 8,000 /month
export const formatSalaryRange = (min, max, period = 'month') => {
  if (!min && !max) return 'Salary not specified';
  if (!max) return `From ${formatBWP(min)} /${period}`;
  if (!min) return `Up to ${formatBWP(max)} /${period}`;
  return `${formatBWP(min)} – ${formatBWP(max)} /${period}`;
};

// Format a date in Africa/Gaborone timezone
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-BW', {
      timeZone: 'Africa/Gaborone',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    });
  } catch {
    return '—';
  }
};

// Format date and time
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-BW', {
      timeZone: 'Africa/Gaborone',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

// Human-readable relative time ("2 hours ago", "3 days ago")
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

// Format a Botswana phone number (7+ digits → +267 7X XXX XXX)
export const formatPhone = (phone) => {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 8) {
    return `+267 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return `+267 ${digits}`;
};

// Experience range to readable label
export const formatExperience = (range) => {
  const map = {
    '0-2': '0–2 years',
    '3-5': '3–5 years',
    '6-9': '6–9 years',
    '10+': '10+ years',
  };
  return map[range] || range || 'Any experience';
};

// Subscription tier label
export const formatTier = (tier) => {
  const map = {
    free: 'Free',
    graduate: 'Graduate Verified',
    premium: 'Premium',
  };
  return map[tier] || tier || 'Free';
};

// Truncate long text
export const truncate = (str, len = 80) => {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + '…';
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Initials from full name
export const getInitials = (fullName) => {
  if (!fullName) return '??';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
