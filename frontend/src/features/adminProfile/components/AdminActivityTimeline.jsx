import React from 'react';
import { History, Activity } from 'lucide-react';

export default function AdminActivityTimeline({ activities = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Recent Administrative Actions</span>
        </h3>
        <span className="text-2xs text-slate-400 font-medium">Audit Trail</span>
      </div>

      <div className="space-y-3.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
        {activities.map((act) => (
          <div key={act.id} className="relative flex items-start gap-3.5 pl-1 text-xs">
            <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center shrink-0 z-10">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                {act.action}
              </h4>
              <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                {act.description}
              </p>
              <span className="text-3xs text-slate-400 mt-1 block font-medium">
                {act.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
