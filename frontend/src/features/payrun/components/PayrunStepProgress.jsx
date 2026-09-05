import React from 'react';
import { Check } from 'lucide-react';

export default function PayrunStepProgress({
  stages = [],
  currentStep = 2,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs mb-6 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[720px] relative">
        {stages.map((st, idx) => {
          const isCompleted = st.step < currentStep || st.state === 'completed';
          const isActive = st.step === currentStep || st.state === 'active';
          const isLast = idx === stages.length - 1;

          return (
            <React.Fragment key={st.step}>
              {/* Step Unit */}
              <div className="flex items-center gap-3 relative z-10 shrink-0">
                {/* Step Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                      : isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-4 ring-indigo-100 dark:ring-indigo-950/70'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {st.step}
                </div>

                {/* Step Labels */}
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isCompleted
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {st.title}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                    {st.subtitle}
                  </span>
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    st.step < currentStep
                      ? 'bg-indigo-600 dark:bg-indigo-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
