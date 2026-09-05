import React from 'react';
import { Download, Mail, Printer } from 'lucide-react';

export default function PayslipQuickActions({
  onDownloadPDF,
  onSendEmail,
  onPrint,
  isDownloading = false,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
        Quick Actions
      </h3>

      <div className="space-y-2.5">
        {/* Download PDF */}
        <button
          type="button"
          onClick={onDownloadPDF}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{isDownloading ? 'Preparing PDF...' : 'Download PDF'}</span>
        </button>

        {/* Send via Email */}
        <button
          type="button"
          onClick={onSendEmail}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Send via Email</span>
        </button>

        {/* Print Payslip */}
        <button
          type="button"
          onClick={onPrint}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Print Payslip</span>
        </button>
      </div>
    </div>
  );
}
