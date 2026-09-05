import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Landmark, Clock, FileText } from 'lucide-react';

export default function ResolveIssueModal({
  isOpen,
  onClose,
  issue,
  onSaveResolution,
}) {
  if (!isOpen || !issue) return null;

  const isBankIssue = issue.issueType.toLowerCase().includes('bank');
  const isOvertimeIssue = issue.issueType.toLowerCase().includes('overtime');
  const isLwpIssue = issue.issueType.toLowerCase().includes('leave') || issue.issueType.toLowerCase().includes('lwp');

  // Form states
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('987654321098');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [verifiedConsent, setVerifiedConsent] = useState(true);

  // Overtime / LWP approval state
  const [approvalNote, setApprovalNote] = useState('Approved by HR & Department Head');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveResolution(issue.id, {
      bankDetails: {
        bankName,
        accountNumber,
        ifsc,
        verified: true,
      },
      note: approvalNote,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {issue.severity === 'error' ? (
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Resolve {issue.issueType}
              </h3>
              <p className="text-xs text-slate-500">
                {issue.employeeName} ({issue.employeeId}) • {issue.department}
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
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 text-xs">
            {/* Context Box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Current Problem Description
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {issue.details}
              </p>
            </div>

            {isBankIssue ? (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={verifiedConsent}
                    onChange={(e) => setVerifiedConsent(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-[11px] text-slate-500 cursor-pointer">
                    Verify account status against penny-drop banking API
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Manager Sign-off / Adjustment Note
                  </label>
                  <input
                    type="text"
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px]">
                    Attendance hours and salary adjustment will be recalculated automatically.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/30 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isBankIssue ? 'Save & Verify Account' : 'Approve & Clear Warning'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
