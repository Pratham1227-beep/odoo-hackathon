import React from 'react';
import { Bell, Calendar, Users, CheckCircle2 } from 'lucide-react';

export default function NotificationStats({
  unreadCount = 12,
  pendingApprovals = 5,
  systemUpdates = 3,
  todayActivities = 28,
  onStatClick,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Unread Notifications */}
      <div
        onClick={() => onStatClick && onStatClick('unread')}
        className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        {/* Red Unread Indicator Dot */}
        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-50 dark:ring-rose-950/40" />

        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Bell className="w-6 h-6 text-rose-500 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {unreadCount}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Unread Notifications
            </p>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div
        onClick={() => onStatClick && onStatClick('approvals')}
        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {pendingApprovals}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Pending Approvals
            </p>
          </div>
        </div>
      </div>

      {/* System Updates */}
      <div
        onClick={() => onStatClick && onStatClick('system')}
        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Users className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {systemUpdates}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              System Updates
            </p>
          </div>
        </div>
      </div>

      {/* Today's Activities */}
      <div
        onClick={() => onStatClick && onStatClick('activities')}
        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {todayActivities}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Today's Activities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
