import React from 'react';
import Teemane from './Teemane';

export const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center animate-slide-up">
      <div className="relative mb-4">
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-zinc-800 pointer-events-none"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin pointer-events-none"></div>
        
        {/* Mascot in the center */}
        <div className="p-4">
          <Teemane pose="thinking" size={80} animate={true} />
        </div>
      </div>
      <p className="text-slate-600 dark:text-zinc-400 font-medium font-sans tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-[#12160d] transition-colors duration-200">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
