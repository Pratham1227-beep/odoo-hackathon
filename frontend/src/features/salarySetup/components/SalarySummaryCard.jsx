import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../data/salarySetupData';

export default function SalarySummaryCard({
  summary,
  period,
  onChangePeriod,
}) {
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
      {/* Header: Title + Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Salary Summary
        </h3>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPeriodOpen(!isPeriodOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{period === 'monthly' ? 'Monthly' : 'Annually'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isPeriodOpen && (
            <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  onChangePeriod('monthly');
                  setIsPeriodOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${
                  period === 'monthly'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangePeriod('annually');
                  setIsPeriodOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${
                  period === 'annually'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                Annually
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Items */}
      <div className="space-y-3 text-sm">
        {/* Basic Salary */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Basic Salary</span>
          <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(summary.basicSalary)}
          </span>
        </div>

        {/* Total Allowances */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Total Allowances</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(summary.totalAllowances)}
          </span>
        </div>

        {/* Gross Salary (highlighted row) */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 rounded-xl font-bold text-slate-900 dark:text-white">
          <span>Gross Salary</span>
          <span className="tabular-nums">
            {formatCurrency(summary.grossSalary)}
          </span>
        </div>

        {/* Total Deductions */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Total Deductions</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
            - {formatCurrency(summary.totalDeductions)}
          </span>
        </div>
      </div>

      {/* Net Salary Highlight Container */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
            Net Salary
          </span>
          {period === 'annually' && (
            <div className="text-[11px] text-indigo-500 dark:text-indigo-400">
              Annualized (12 Months)
            </div>
          )}
        </div>
        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight tabular-nums">
          {formatCurrency(summary.netSalary)}
        </div>
      </div>
    </div>
  );
}
