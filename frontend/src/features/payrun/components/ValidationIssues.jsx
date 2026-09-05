import React, { useState } from 'react';
import { X, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ValidationIssues({
  errorsCount = 2,
  warningsCount = 4,
  onSelectIssueFilter,
  onViewAll,
  onReviewIssue,
}) {
  const [activeTab, setActiveTab] = useState('Errors');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Issues to Resolve
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('Errors')}
          className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'Errors'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <span>Errors ({errorsCount})</span>
          {activeTab === 'Errors' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-400 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Warnings')}
          className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'Warnings'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <span>Warnings ({warningsCount})</span>
          {activeTab === 'Warnings' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-3">
        {activeTab === 'Errors' ? (
          errorsCount === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                No Blocking Errors
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All employee accounts & salary components are verified.
              </p>
            </div>
          ) : (
            <>
              {/* Error 1: Missing Bank Account Details */}
              <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Missing Bank Account Details
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      2 employees do not have active bank account details.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectIssueFilter('Missing Bank Details')}
                  className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  View Employees
                </button>
              </div>

              {/* Error 2: Invalid Salary Component */}
              <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Invalid Salary Component
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      1 employee has an invalid component configuration.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectIssueFilter('Invalid Salary Component')}
                  className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  View Employee
                </button>
              </div>
            </>
          )
        ) : warningsCount === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              No Pending Warnings
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All overtime and leave without pay records have been acknowledged.
            </p>
          </div>
        ) : (
          <>
            {/* Warning 1: Overtime Not Approved */}
            <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    Overtime Not Approved
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    3 employees have unapproved overtime hours.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectIssueFilter('Unapproved Overtime')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                Review
              </button>
            </div>

            {/* Warning 2: Leave Without Pay */}
            <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    Leave Without Pay
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    1 employee has LWP marked. Please verify.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectIssueFilter('Leave Without Pay')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
