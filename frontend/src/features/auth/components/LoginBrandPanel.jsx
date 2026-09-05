import React from 'react';
import { Users, ShieldCheck, BarChart3 } from 'lucide-react';

export default function LoginBrandPanel() {
  return (
    <div className="flex flex-col justify-between h-full py-2 px-2 sm:px-4 lg:px-6 space-y-8 select-none">
      {/* Top Marketing Copy */}
      <div className="space-y-4">
        {/* Eyebrow Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span>Payroll made simple. Secure. Smarter.</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          Welcome <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
            Back!
          </span>
        </h1>

        {/* Supporting description */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md font-normal leading-relaxed">
          Log in to your WageWise account and continue managing your workforce with confidence.
        </p>
      </div>

      {/* 3 Benefit Rows */}
      <div className="space-y-6 py-2">
        {/* Benefit 1 */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/50 shrink-0 shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Manage Your Team
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Access employee records, attendance, and payroll — all in one place.
            </p>
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/50 shrink-0 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Secure & Reliable
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Your data is protected with enterprise-grade security.
            </p>
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shrink-0 shadow-2xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Stay Productive
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Save time with automated payroll and smart insights.
            </p>
          </div>
        </div>
      </div>

      {/* Handwritten Annotation at Bottom Right */}
      <div className="flex items-start justify-end gap-2 pr-6 pt-2 pointer-events-none select-none">
        <svg
          className="w-10 h-10 text-indigo-600 dark:text-indigo-400 stroke-current fill-none transform -rotate-12 shrink-0"
          viewBox="0 0 50 50"
        >
          <path
            d="M10,40 Q30,45 40,20 Q42,15 35,10 M40,20 L30,22 M40,20 L38,30"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="font-serif italic font-semibold text-indigo-800 dark:text-indigo-300 text-sm tracking-wide transform rotate-2 pt-1 leading-tight">
          <span>Same people.</span> <br />
          <span>A smarter payroll.</span>
        </div>
      </div>
    </div>
  );
}
