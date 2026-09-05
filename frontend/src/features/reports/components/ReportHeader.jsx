import React from 'react';
import { Download, Calendar, Filter } from 'lucide-react';

export default function ReportHeader({
  selectedPeriod,
  onChangePeriod,
  onOpenExport,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Executive insights across payroll disbursements, attendance health, workforce distribution, and statutory compliance.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Calendar className="w-4 h-4" />
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => onChangePeriod(e.target.value)}
            className="pl-9 pr-8 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs appearance-none cursor-pointer"
          >
            <option value="sep2026">September 2026</option>
            <option value="aug2026">August 2026</option>
            <option value="q2_2026">Q2 (Jul - Sep 2026)</option>
            <option value="fy2026">FY 2026 - 2027 (YTD)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onOpenExport}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
}
