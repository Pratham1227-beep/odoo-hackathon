import React from 'react';
import { FileText, ExternalLink, Calendar, Clock, DollarSign, UserCheck } from 'lucide-react';

export default function ContractDetailsCard({
  contract,
  onViewEdit,
  onOpenDocument,
}) {
  if (!contract) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs text-center text-xs text-slate-400">
        Select a contract from the table to inspect details.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Active
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Expiring Soon
          </span>
        );
      case 'Expired':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Expired
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
          Contract Details
        </h3>
        <button
          type="button"
          onClick={() => onViewEdit(contract)}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          View / Edit
        </button>
      </div>

      {/* Selected Employee Identity */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {contract.avatar ? (
            <img
              src={contract.avatar}
              alt={contract.employeeName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-50 dark:ring-indigo-950"
            />
          ) : (
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs ${
                contract.avatarBg || 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {contract.initials || 'EM'}
            </div>
          )}

          <div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              {contract.employeeName}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {contract.employeeId} • {contract.designation}
            </div>
          </div>
        </div>

        {getStatusBadge(contract.status)}
      </div>

      {/* Key-Value Details */}
      <div className="space-y-2.5 pt-2 text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Contract Type</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {contract.contractType}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Start Date</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {contract.startDate}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">End Date</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {contract.endDate}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Notice Period</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {contract.noticePeriod || '3 Months'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Working Hours</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {contract.workingHours || '9:00 AM – 5:00 PM'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Salary</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {contract.salaryFormatted || `₹${contract.salary?.toLocaleString() || '85,000'} / month`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Reporting Manager</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {contract.reportingManager || 'Rohan Mehta'}
          </span>
        </div>

        {/* Contract Document link */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-400">Contract Document</span>
          <button
            type="button"
            onClick={() => onOpenDocument(contract)}
            className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer text-[11px]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="underline truncate max-w-[150px]">
              {contract.document?.name || 'Employment_Contract.pdf'}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <span className="text-slate-400">Last Updated</span>
          <span className="text-slate-500 dark:text-slate-400">
            {contract.lastUpdated || '12 Jan 2024, 10:24 AM'}
          </span>
        </div>
      </div>
    </div>
  );
}
