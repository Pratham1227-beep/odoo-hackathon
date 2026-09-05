import React from 'react';
import { Users, Check, Clock } from 'lucide-react';

export default function PayrunStats({
  totalEmployees = 118,
  processedEmployees = 112,
  pendingEmployees = 6,
}) {
  const processedPercent =
    totalEmployees > 0
      ? ((processedEmployees / totalEmployees) * 100).toFixed(1)
      : '0.0';

  const pendingPercent =
    totalEmployees > 0
      ? ((pendingEmployees / totalEmployees) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Total Employees */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
        {/* Purple Tinted Icon */}
        <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100/80 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {totalEmployees}
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            Total Employees
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            Eligible for payroll
          </span>
        </div>
      </div>

      {/* Card 2: Employees Processed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between transition-all hover:shadow-xs">
        <div className="flex items-center gap-4">
          {/* Green Circle Check Icon */}
          <div className="w-13 h-13 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs shadow-emerald-500/20">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              {processedEmployees}
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              Employees Processed
            </span>
          </div>
        </div>
        {/* Percentage badge */}
        <div className="self-start">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
            {processedPercent}%
          </span>
        </div>
      </div>

      {/* Card 3: Pending */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between transition-all hover:shadow-xs">
        <div className="flex items-center gap-4">
          {/* Orange/Amber Circle Clock Icon */}
          <div className="w-13 h-13 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs shadow-amber-500/20">
            <Clock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              {pendingEmployees}
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              Pending
            </span>
          </div>
        </div>
        {/* Percentage badge */}
        <div className="self-start">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60">
            {pendingPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
