import React from 'react';

/**
 * CircularProgress — SVG-based circular progress ring
 * Props: value (0-100), size, strokeWidth, color, label, showPercent
 */
export const CircularProgress = ({
  value = 0,
  size = 80,
  strokeWidth = 6,
  color = '#6B7C3A',
  label = '',
  showPercent = true,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            {showPercent && (
              <span className="font-display font-extrabold" style={{ fontSize: size * 0.2, color }}>
                {Math.round(value)}%
              </span>
            )}
            {label && (
              <span className="text-zinc-500 font-sans" style={{ fontSize: size * 0.1 }}>
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
