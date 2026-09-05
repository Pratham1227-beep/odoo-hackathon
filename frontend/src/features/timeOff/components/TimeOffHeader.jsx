import React from 'react';
import { Plus, Award, Layers } from 'lucide-react';

export default function TimeOffHeader({
  onOpenNewRequest,
  onOpenAllocation,
  onOpenNewLeaveType,
  isHR,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Time Off Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage leave requests, annual allocations, leave policies, and company holidays.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {isHR && onOpenNewLeaveType && (
          <button
            onClick={onOpenNewLeaveType}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>New Leave Type</span>
          </button>
        )}

        {isHR && onOpenAllocation && (
          <button
            onClick={onOpenAllocation}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold transition-all cursor-pointer hover:scale-[1.01]"
          >
            <Award className="w-4 h-4" />
            <span>Grant Allocation</span>
          </button>
        )}

        <button
          onClick={onOpenNewRequest}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>New Time Off Request</span>
        </button>
      </div>
    </div>
  );
}
