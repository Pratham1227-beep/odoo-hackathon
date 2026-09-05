import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

export default function RecentPayruns({
  payruns = [],
  onSelectPayrun,
  onViewAll,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Recent Payruns
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Payruns List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {payruns.map((run) => (
          <div
            key={run.id}
            onClick={() => onSelectPayrun && onSelectPayrun(run)}
            className="flex items-center justify-between py-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-1 rounded-xl transition-colors cursor-pointer group"
          >
            {/* Left: Icon + Month + Date */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-2xs shadow-emerald-500/20">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {run.period}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Processed on {run.processedDate}
                </span>
              </div>
            </div>

            {/* Right: Amount + Chevron */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {run.totalPayoutFormatted}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
