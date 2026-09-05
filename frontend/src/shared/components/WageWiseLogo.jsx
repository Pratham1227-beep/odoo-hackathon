import React from 'react';

export default function WageWiseLogo({ className = '', showTagline = true, iconOnly = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Mark */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 shadow-md shadow-indigo-500/20 shrink-0">
        <div className="w-full h-full bg-indigo-600 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          <svg className="w-5 h-5 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7L8.5 17L12 10L15.5 17L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Wage<span className="text-indigo-600 dark:text-indigo-400">Wise</span>
            </span>
          </div>
          {showTagline && (
            <span className="text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 -mt-0.5">
              Know Before You Pay.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
