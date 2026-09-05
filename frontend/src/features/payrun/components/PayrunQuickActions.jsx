import React from 'react';
import { FileText, Download, Send, Lock } from 'lucide-react';

export default function PayrunQuickActions({
  onPreviewPayroll,
  onDownloadReports,
  onSendPayslips,
  onMarkFinalized,
  isFinalized = false,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
      {/* Title */}
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
        Quick Actions
      </h3>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Preview Payroll */}
        <button
          type="button"
          onClick={onPreviewPayroll}
          className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100/80 dark:border-sky-800/40 hover:bg-sky-100/70 dark:hover:bg-sky-900/40 transition-all cursor-pointer group text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-2xs mb-2 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Preview Payroll
          </span>
        </button>

        {/* Download Reports */}
        <button
          type="button"
          onClick={onDownloadReports}
          className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-800/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition-all cursor-pointer group text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-2xs mb-2 group-hover:scale-105 transition-transform">
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Download Reports
          </span>
        </button>

        {/* Send Payslips */}
        <button
          type="button"
          onClick={onSendPayslips}
          className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-800/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 transition-all cursor-pointer group text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-2xs mb-2 group-hover:scale-105 transition-transform">
            <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Send Payslips
          </span>
        </button>

        {/* Mark as Finalized */}
        <button
          type="button"
          onClick={onMarkFinalized}
          disabled={isFinalized}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center ${
            isFinalized
              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
              : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-100/80 dark:border-amber-800/40 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 cursor-pointer group'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-2xs mb-2 group-hover:scale-105 transition-transform">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {isFinalized ? 'Finalized' : 'Mark as Finalized'}
          </span>
        </button>
      </div>
    </div>
  );
}
