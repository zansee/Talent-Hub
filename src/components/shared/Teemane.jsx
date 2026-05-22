import React from 'react';

const poses = {
  default: '/assets/teemane/teemane_default.png',
  waving: '/assets/teemane/teemane_waving.png',
  celebrating: '/assets/teemane/teemane_celebrating.png',
  thinking: '/assets/teemane/teemane_thinking.png',
};

export const Teemane = ({ pose = 'default', size = 150, className = '', animate = true }) => {
  const src = poses[pose] || poses.default;

  let animationClass = '';
  if (animate) {
    if (pose === 'waving') {
      animationClass = 'animate-bounce';
    } else if (pose === 'thinking') {
      animationClass = 'animate-pulse';
    } else if (pose === 'celebrating') {
      animationClass = 'hover:scale-110 transition-transform duration-300';
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src={src}
        alt={`Teemane mascot - ${pose}`}
        style={{ width: `${size}px`, height: 'auto' }}
        className={`object-contain max-w-full ${animationClass}`}
      />
    </div>
  );
};

export default Teemane;
