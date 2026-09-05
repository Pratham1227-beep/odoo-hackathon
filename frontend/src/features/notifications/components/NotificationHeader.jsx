import React from 'react';
import { Settings, Check } from 'lucide-react';

export default function NotificationHeader({ onOpenSettings, onMarkAllAsRead }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Notifications / Activity
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Stay updated with important alerts and track recent activities across the system.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Notification Settings</span>
        </button>

        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>
    </div>
  );
}
