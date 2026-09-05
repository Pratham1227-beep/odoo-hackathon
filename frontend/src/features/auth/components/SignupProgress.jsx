import React from 'react';
import { Check } from 'lucide-react';

export default function SignupProgress({ currentStep = 1, onStepClick }) {
  const steps = [
    { number: 1, label: 'Organization' },
    { number: 2, label: currentStep >= 2 ? 'Admin Details' : 'Admin Account' },
    { number: 3, label: 'Complete' },
  ];

  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-between">
        {/* Connecting Lines */}
        <div className="absolute left-8 right-8 top-4 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
            style={{
              width:
                currentStep === 1
                  ? '0%'
                  : currentStep === 2
                  ? '50%'
                  : '100%',
            }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((s) => {
          const isActive = currentStep === s.number;
          const isCompleted = currentStep > s.number;
          const isClickable = onStepClick && currentStep > s.number;

          return (
            <div
              key={s.number}
              onClick={() => isClickable && onStepClick(s.number)}
              className={`relative z-10 flex flex-col items-center group ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Circle Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-100 dark:ring-indigo-950/80 scale-105'
                    : isCompleted
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.number}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-xs font-semibold tracking-tight transition-colors duration-200 ${
                  isActive || isCompleted
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
