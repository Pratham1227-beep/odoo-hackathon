import React from 'react';
import { Check, Loader2, ArrowRight } from 'lucide-react';

export default function PayrunProgress({
  progressPercentage = '94.9',
  stages = [],
  onAdvanceStage,
  currentStageNumber = 5,
  isProcessing = false,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Payrun Progress
        </h3>
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {progressPercentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, Number(progressPercentage)))}%` }}
        />
      </div>

      {/* 5-Step Workflow */}
      <div className="space-y-4 relative">
        {stages.map((stage, idx) => {
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'active';
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage.step} className="flex items-start gap-3 relative">
              {/* Connecting vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                    isCompleted
                      ? 'bg-emerald-400/70 dark:bg-emerald-600/50'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}

              {/* Step indicator circle */}
              <div className="relative z-10 shrink-0">
                {isCompleted ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xs shadow-emerald-500/20">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : isActive ? (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-2xs shadow-indigo-600/30 text-xs font-bold">
                    {isProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      stage.step
                    )}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs font-semibold">
                    {stage.step}
                  </div>
                )}
              </div>

              {/* Step Details */}
              <div className="flex flex-col pt-0.5">
                <span
                  className={`text-xs font-bold leading-tight ${
                    isCompleted || isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {stage.title}
                </span>
                <span
                  className={`text-[11px] leading-tight mt-0.5 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {stage.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive advance action if not yet finalized */}
      {currentStageNumber < 6 && onAdvanceStage && (
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onAdvanceStage}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : currentStageNumber === 5 ? (
              <>
                <span>Complete & Finalize Payrun</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Proceed to Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
