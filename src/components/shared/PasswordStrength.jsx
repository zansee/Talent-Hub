import React from 'react';

export const PasswordStrength = ({ password = '' }) => {
  const getStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score, label: '', color: 'bg-slate-200' };

    // Evaluation rules
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
      case 2:
        return { score, label: 'Fair', color: 'bg-orange-500', text: 'text-orange-500' };
      case 3:
        return { score, label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-500' };
      case 4:
        return { score, label: 'Strong', color: 'bg-green-500', text: 'text-green-500' };
      default:
        return { score, label: '', color: 'bg-slate-200', text: 'text-slate-400' };
    }
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5 w-full mt-1.5 font-sans animate-slide-up">
      <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
        <span>Password Strength:</span>
        <span className={strength.text}>{strength.label}</span>
      </div>
      
      {/* Visual meter bar */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
        <div className={`h-full flex-1 rounded-l-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-200 dark:bg-zinc-800'}`} />
        <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-slate-200 dark:bg-zinc-800'}`} />
        <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-200 dark:bg-zinc-800'}`} />
        <div className={`h-full flex-1 rounded-r-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-slate-200 dark:bg-zinc-800'}`} />
      </div>
      
      {password.length < 8 && (
        <span className="text-[10px] text-slate-400 dark:text-zinc-500">
          Must be at least 8 characters.
        </span>
      )}
    </div>
  );
};

export default PasswordStrength;
