import React, { useState } from 'react';
import { X, Ban, AlertTriangle } from 'lucide-react';

export default function TerminateContractModal({
  isOpen,
  onClose,
  contract,
  onConfirmTermination,
}) {
  const [terminationDate, setTerminationDate] = useState('2026-09-30');
  const [reason, setReason] = useState('Mutual Agreement');
  const [notes, setNotes] = useState('');

  if (!isOpen || !contract) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onConfirmTermination(contract.id, {
      terminationDate,
      reason,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Terminate Employment Contract
              </h2>
              <p className="text-slate-400 text-[11px]">
                Mark employment contract as terminated.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white text-xs">
              {contract.employeeName} ({contract.employeeId})
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {contract.designation} • {contract.department} • {contract.contractType}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Termination Date *
            </label>
            <input
              type="date"
              required
              value={terminationDate}
              onChange={(e) => setTerminationDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Termination Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Resignation">Employee Resignation</option>
              <option value="Termination">Employer Termination</option>
              <option value="End of Contract">Contract Expiration / Term Completion</option>
              <option value="Mutual Agreement">Mutual Separation Agreement</option>
              <option value="Other">Other Operational Reason</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason Notes / Exit Clearance
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Handover completed, assets returned, notice served."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
            >
              Terminate Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
