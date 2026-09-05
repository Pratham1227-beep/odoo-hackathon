import React from 'react';
import { Plus } from 'lucide-react';

export default function EmployeeHeader({ onAddClick }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
      {/* Title Area */}
      <div className="space-y-1.5">
        {/* Breadcrumb Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span>Employees</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Manage Your{' '}
          <span className="bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">
            Employees
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          View, add, edit and manage all employee records in one place.
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={onAddClick}
        className="inline-flex items-center justify-center gap-2 self-start sm:self-center py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Employee</span>
      </button>
    </div>
  );
}
