import React from 'react';
import { Plus } from 'lucide-react';

export default function TimeOffHeader({ onOpenNewRequest }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Time Off
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage leave requests, holidays, and employee time off.
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="flex items-center gap-3">
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
