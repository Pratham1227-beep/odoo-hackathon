import React from 'react';
import { IndianRupee, Edit3 } from 'lucide-react';

export default function SalaryInfoCard({ data, onEdit }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Salary Information
        </h3>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors cursor-pointer"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>

      {/* Prominent CTC Box */}
      <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
          <IndianRupee className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {data.formattedCTC}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Monthly CTC
          </div>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="space-y-2.5 pt-1 text-xs">
        {data.breakdown.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-slate-600 dark:text-slate-400"
          >
            <span>{item.label}</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
