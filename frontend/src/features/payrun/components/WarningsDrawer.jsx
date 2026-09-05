import React from 'react';
import { X, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Check } from 'lucide-react';

export default function WarningsDrawer({
  isOpen,
  onClose,
  pendingEmployees = [],
  onResolveEmployee,
  onResolveAll,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Payroll Compliance Warnings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pendingEmployees.length} issues flagged requiring attention before finalization
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Items List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {pendingEmployees.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                All Warnings Resolved!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                All employees have verified banking and statutory compliance details.
              </p>
            </div>
          ) : (
            pendingEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {emp.name}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                      {emp.id}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{emp.department}</span>
                  </div>

                  <div className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                    <span className="font-semibold shrink-0">Issue:</span>
                    <span>
                      {emp.warnings && emp.warnings.length > 0
                        ? emp.warnings.join(', ')
                        : 'Missing verified bank IFSC or account number'}
                    </span>
                  </div>
                </div>

                {/* Fix Action Button */}
                <button
                  type="button"
                  onClick={() => onResolveEmployee(emp.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-900/60 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Verify & Resolve</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          {pendingEmployees.length > 0 && (
            <button
              type="button"
              onClick={onResolveAll}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-amber-600/30 transition-colors cursor-pointer"
            >
              <span>Auto-Resolve All ({pendingEmployees.length})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
