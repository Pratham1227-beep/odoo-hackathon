import React from 'react';
import { Bell, Archive } from 'lucide-react';

export default function QuickActions({ onMarkAllAsRead, onViewArchived }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3.5">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-colors cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="truncate">Mark All as Read</span>
        </button>

        <button
          type="button"
          onClick={onViewArchived}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-colors cursor-pointer"
        >
          <Archive className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="truncate">View Archived</span>
        </button>
      </div>
    </div>
  );
}
