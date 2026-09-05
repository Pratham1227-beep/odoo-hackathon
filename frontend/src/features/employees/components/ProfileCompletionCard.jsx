import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ProfileCompletionCard({ data, onCompleteClick }) {
  const percentage = data.percentage || 90;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Profile Completion
      </h3>

      <div className="flex items-center gap-4">
        {/* SVG Circular Progress Ring */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background Ring */}
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress Ring */}
            <path
              className="text-teal-500 dark:text-teal-400 transition-all duration-700"
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
            {percentage}%
          </span>
        </div>

        {/* Text Description */}
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            {data.title}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {data.description}
          </p>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={onCompleteClick}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 active:bg-indigo-200 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-colors cursor-pointer"
      >
        <span>{data.actionLabel || 'Complete Profile →'}</span>
      </button>
    </div>
  );
}
