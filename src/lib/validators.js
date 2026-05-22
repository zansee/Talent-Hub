/**
 * TalentHub Botswana — Form Validators
 */

export const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const isValidPhone = (phone) => /^\d{7,8}$/.test(phone); // Botswana format

export const isValidPassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    get score() {
      const checks = [this.length, this.uppercase, this.lowercase, this.number];
      return checks.filter(Boolean).length;
    },
    get label() {
      const s = this.score;
      if (s <= 1) return 'Very Weak';
      if (s === 2) return 'Weak';
      if (s === 3) return 'Good';
      return 'Strong';
    },
    get color() {
      const s = this.score;
      if (s <= 1) return '#ef4444';
      if (s === 2) return '#f59e0b';
      if (s === 3) return '#6B7C3A';
      return '#22c55e';
    },
  };
};

export const validateJob = (data) => {
  const errors = {};
  if (!data.title?.trim()) errors.title = 'Job title is required.';
  if (!data.description?.trim()) errors.description = 'Job description is required.';
  if (!data.industry) errors.industry = 'Industry is required.';
  if (!data.employment_type) errors.employment_type = 'Employment type is required.';
  if (!data.location) errors.location = 'Location is required.';
  if (data.salary_min && data.salary_max && +data.salary_min > +data.salary_max) {
    errors.salary_max = 'Max salary must be greater than min salary.';
  }
  return errors;
};

export const validateProfile = (data) => {
  const errors = {};
  if (!data.full_name?.trim()) errors.full_name = 'Full name is required.';
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Phone must be 7-8 digits (Botswana format).';
  }
  return errors;
};
