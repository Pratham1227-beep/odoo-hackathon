import React from 'react';
import { UserPlus } from 'lucide-react';

export default function InternHeader({ onAddIntern }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Interns</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your organization's interns, mentorship, progress and internship lifecycle.
        </p>
      </div>

      <button
        onClick={onAddIntern}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
      >
        <UserPlus className="w-4 h-4" />
        <span>Add Intern</span>
      </button>
    </div>
  );
}
