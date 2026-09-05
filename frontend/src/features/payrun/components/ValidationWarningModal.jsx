import React from 'react';
import { X, AlertOctagon, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ValidationWarningModal({
  isOpen,
  onClose,
  errorsCount = 0,
  warningsCount = 0,
  onProceedAnyway,
  onFixErrors,
}) {
  if (!isOpen) return null;

  const hasErrors = errorsCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center">
          {hasErrors ? (
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
              <AlertOctagon className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {hasErrors
              ? 'Critical Validation Errors Detected'
              : 'Payroll Warnings Present'}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {hasErrors ? (
              <>
                <strong className="text-rose-600 dark:text-rose-400">
                  {errorsCount} blocking error(s)
                </strong>{' '}
                must be resolved before payroll can be processed. Bank account details are missing or invalid, preventing direct deposit.
              </>
            ) : (
              <>
                <strong className="text-amber-600 dark:text-amber-400">
                  {warningsCount} non-blocking warning(s)
                </strong>{' '}
                were identified. You may review them or proceed to generate payslips with current attendance adjustments.
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer"
          >
            {hasErrors ? 'Dismiss' : 'Cancel & Review'}
          </button>

          {hasErrors ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onFixErrors();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Review Blocking Errors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedAnyway();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Acknowledge & Proceed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
