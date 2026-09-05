import React, { useState, useEffect } from 'react';
import { X, RotateCw, AlertCircle } from 'lucide-react';

export default function RenewContractModal({
  isOpen,
  onClose,
  contract,
  onConfirmRenewal,
}) {
  const [newContractType, setNewContractType] = useState('Permanent');
  const [newEndDate, setNewEndDate] = useState('');
  const [newSalary, setNewSalary] = useState(85000);
  const [renewalNotes, setRenewalNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (contract) {
      setNewContractType(contract.contractType === 'Probation' ? 'Permanent' : contract.contractType);
      setNewSalary(contract.salary || 85000);
      setNewEndDate('');
      setRenewalNotes('Contract successfully renewed based on annual review performance milestones.');
    }
  }, [contract]);

  if (!isOpen || !contract) return null;

  const isPermanent = newContractType === 'Permanent';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isPermanent && !newEndDate) {
      setError('Please provide a new end date for the contract extension.');
      return;
    }

    setError('');

    onConfirmRenewal(contract.id, {
      contractType: newContractType,
      endDate: isPermanent ? '-' : newEndDate,
      salary: Number(newSalary) || contract.salary,
      salaryFormatted: `₹${(Number(newSalary) || contract.salary).toLocaleString()} / month`,
      status: 'Active',
      renewalNotes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Renew Contract
              </h2>
              <p className="text-slate-400 mt-0.5">
                Extend validity period or convert contract terms.
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
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Contract Info */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white text-xs">
              {contract.employeeName} ({contract.employeeId})
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Current: {contract.contractType} • {contract.startDate} to {contract.endDate}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Renewed Contract Type
            </label>
            <select
              value={newContractType}
              onChange={(e) => setNewContractType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Permanent">Permanent (Indefinite)</option>
              <option value="Fixed Term">Fixed Term</option>
              <option value="Consultant">Consultant</option>
              <option value="Probation Extension">Probation Extension</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New End Date {isPermanent ? '(Not applicable for Permanent)' : '*'}
            </label>
            <input
              type="text"
              disabled={isPermanent}
              placeholder={isPermanent ? '-' : 'e.g. 14 Jan 2027'}
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Revised Salary (₹/month)
            </label>
            <input
              type="number"
              value={newSalary}
              onChange={(e) => setNewSalary(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Renewal Justification Notes
            </label>
            <textarea
              rows={2}
              value={renewalNotes}
              onChange={(e) => setRenewalNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          {/* Actions */}
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
            >
              Confirm Renewal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
