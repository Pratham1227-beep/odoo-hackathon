import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function LeaveRequestHeader({ onOpenNewRequest }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Leave Request / <span className="text-indigo-600 dark:text-indigo-400">Approval</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review and manage employee leave requests.
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenNewRequest}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.01]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Leave Request</span>
        </button>
      </div>
    </div>
  );
}
