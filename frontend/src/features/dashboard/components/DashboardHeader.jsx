import React from 'react';
import { Calendar } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
      {/* Title and Subtitle */}
      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          Good morning, Admin!
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Here’s what’s happening{' '}
          <span className="bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">
            today.
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your workforce, track payroll and keep everything on schedule.
        </p>
      </div>

      {/* Date Indicator Badge */}
      <div className="inline-flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        <span>Monday, 8 Sep 2026</span>
      </div>
    </div>
  );
}
