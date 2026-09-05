import React from 'react';

const dotColorStyles = {
  emerald: 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60',
  blue: 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-950/60',
  purple: 'bg-purple-500 ring-4 ring-purple-100 dark:ring-purple-950/60',
  indigo: 'bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950/60',
};

export default function PayslipHistory({ history = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
        Payslip History
      </h3>

      <div className="relative pl-6 space-y-5">
        {/* Continuous vertical line */}
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800" />

        {history.map((item) => {
          const dotStyle =
            dotColorStyles[item.dotColor] || dotColorStyles.emerald;

          return (
            <div key={item.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${dotStyle} transition-transform group-hover:scale-125`}
              />

              {/* Text */}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                  {item.timestamp}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 font-medium">
                  {item.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
