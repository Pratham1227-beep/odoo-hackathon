import React from 'react';
import { Users, Calendar, Percent, FileCheck, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      stepNumber: '1',
      title: '1. Set Up',
      description: 'Add your employees, contracts and working schedules.',
      icon: Users,
      iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    },
    {
      stepNumber: '2',
      title: '2. Track',
      description: 'Capture attendance and manage time off effortlessly.',
      icon: Calendar,
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    },
    {
      stepNumber: '3',
      title: '3. Calculate & Validate',
      description: 'Run payroll with smart rules and get instant issue alerts.',
      icon: Percent,
      iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    },
    {
      stepNumber: '4',
      title: '4. Pay with Confidence',
      description: 'Generate payslips and make payments — knowing everything is right.',
      icon: FileCheck,
      iconBg: 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Rounded Soft Tinted Outer Container */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 sm:p-12 md:p-16 border border-slate-200 dark:border-slate-800 shadow-xs">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800">
              <span>⚙</span> Simple. Connected. Powerful.
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How WageWise Works
            </h2>
          </div>

          {/* 4 Steps Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.stepNumber} className="relative flex flex-col items-center text-center group">
                  
                  {/* Icon Badge */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xs ${step.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                    <StepIcon className="w-7 h-7" />
                  </div>

                  {/* Connecting Arrow for Desktop (between items) */}
                  {!isLast && (
                    <div className="hidden md:flex absolute top-7 left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] items-center justify-center pointer-events-none z-10">
                      <div className="w-full flex items-center justify-center gap-1">
                        <div className="w-full border-t-2 border-dashed border-indigo-200 dark:border-indigo-800" />
                        <ArrowRight className="w-4 h-4 text-indigo-400 dark:text-indigo-500 shrink-0 -ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Step Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xs">
                    {step.description}
                  </p>

                  {/* Mobile Connecting Arrow */}
                  {!isLast && (
                    <div className="flex md:hidden my-4 text-indigo-400 dark:text-indigo-500">
                      <div className="h-6 border-l-2 border-dashed border-indigo-300 dark:border-indigo-800" />
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
