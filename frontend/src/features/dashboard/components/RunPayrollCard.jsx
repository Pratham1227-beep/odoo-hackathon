import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RunPayrollCard() {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl p-6 bg-gradient-to-br from-teal-50/90 via-sky-50/50 to-indigo-50/30 dark:from-teal-950/40 dark:via-slate-900 dark:to-indigo-950/30 border border-teal-100/90 dark:border-teal-900/60 shadow-xs flex flex-col justify-between space-y-5">
      {/* Icon & Details */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-400/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Run Payroll
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Process salaries for this month in just a few clicks.
          </p>
        </div>
      </div>

      {/* Prominent Action Button */}
      <button
        onClick={() => navigate('/payroll')}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>Run Payroll</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
