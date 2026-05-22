import React from 'react';

export const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  icon: Icon,
  rows, // for textarea
}) => {
  const isTextarea = type === 'textarea';
  
  const inputBaseStyle = 'w-full px-4 py-2 text-sm font-sans rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-zinc-900 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 border-slate-300 dark:border-zinc-700';
  const inputErrorStyle = error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : '';
  const paddingLeftStyle = Icon ? 'pl-10' : '';

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-zinc-400 font-sans uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
            <Icon size={18} />
          </div>
        )}
        {isTextarea ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={rows || 4}
            className={`${inputBaseStyle} ${inputErrorStyle} ${paddingLeftStyle} resize-none`}
          />
        ) : (
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${inputBaseStyle} ${inputErrorStyle} ${paddingLeftStyle}`}
          />
        )}
      </div>
      {error && (
        <span className="text-xs font-sans text-red-500 mt-0.5 animate-slide-up">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
