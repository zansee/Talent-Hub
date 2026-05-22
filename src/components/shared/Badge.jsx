import React from 'react';

/**
 * Badge — Inline status/category badge
 * Props: variant, size, children
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variants = {
    default: 'bg-zinc-900 border border-zinc-800 text-zinc-300',
    primary: 'bg-primary/15 border border-primary/30 text-primary',
    success: 'bg-green-900/30 border border-green-800/40 text-green-400',
    warning: 'bg-yellow-900/30 border border-yellow-800/40 text-yellow-400',
    danger: 'bg-red-900/30 border border-red-800/40 text-red-400',
    info: 'bg-blue-900/30 border border-blue-800/40 text-blue-400',
    purple: 'bg-purple-900/30 border border-purple-800/40 text-purple-400',
    verified: 'bg-green-950/30 border border-green-900/30 text-green-400',
  };
  const sizes = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-bold tracking-wide ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
