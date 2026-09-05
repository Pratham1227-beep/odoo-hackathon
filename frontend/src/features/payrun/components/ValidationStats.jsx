import React from 'react';
import { Users, Check, AlertTriangle, XCircle, X } from 'lucide-react';

export default function ValidationStats({
  totalEmployees = 0,
  validRecords = 0,
  warningsCount = 0,
  errorsCount = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total Employees */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100/80 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {totalEmployees}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            Total Employees
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            In this payrun
          </span>
        </div>
      </div>

      {/* Card 2: Valid Records */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs shadow-emerald-500/20">
          <Check className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {validRecords}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            Valid Records
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            Ready for processing
          </span>
        </div>
      </div>

      {/* Card 3: Warnings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
        <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs shadow-amber-500/20 text-lg font-bold">
          !
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {warningsCount}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            Warnings
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            Need review (non-blocking)
          </span>
        </div>
      </div>

      {/* Card 4: Errors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs shadow-rose-500/20">
          <X className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {errorsCount}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            Errors
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            Must fix to proceed
          </span>
        </div>
      </div>
    </div>
  );
}
