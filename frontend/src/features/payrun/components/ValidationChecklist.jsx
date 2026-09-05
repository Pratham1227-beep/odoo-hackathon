import React from 'react';
import {
  RotateCw,
  Users,
  Calendar,
  FileText,
  Percent,
  Landmark,
  Calculator,
  Check,
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';

const iconMap = {
  Users: Users,
  Calendar: Calendar,
  FileText: FileText,
  Percent: Percent,
  Landmark: Landmark,
  Calculator: Calculator,
};

export default function ValidationChecklist({
  checklist = [],
  onRevalidate,
  isRevalidating = false,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Validation Checklist
        </h3>
        <button
          type="button"
          onClick={onRevalidate}
          disabled={isRevalidating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          {isRevalidating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          ) : (
            <RotateCw className="w-3.5 h-3.5" />
          )}
          <span>{isRevalidating ? 'Validating...' : 'Revalidate'}</span>
        </button>
      </div>

      {/* 6 Checklist items */}
      <div className="space-y-3.5">
        {checklist.map((item) => {
          const IconComponent = iconMap[item.icon] || FileText;
          const isPassed = item.status === 'passed';
          const isWarning = item.status === 'warning';
          const isError = item.status === 'error';

          return (
            <div
              key={item.id}
              className="flex items-center justify-between py-1.5 px-1 rounded-xl transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
            >
              {/* Left: Icon & Description */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isPassed
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60'
                      : isWarning
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60'
                  }`}
                >
                  <IconComponent className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {item.description}
                  </span>
                </div>
              </div>

              {/* Right: Status Pill */}
              <div className="shrink-0">
                {isPassed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Passed</span>
                  </span>
                )}
                {isWarning && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Warnings</span>
                  </span>
                )}
                {isError && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                    <X className="w-3 h-3 stroke-[2.5]" />
                    <span>Errors</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
