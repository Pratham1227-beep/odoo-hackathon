import React from 'react';
import { Calendar, Check, Users, BarChart3 } from 'lucide-react';

const taskIcons = {
  Calendar,
  CheckCircle2: Check,
  Users,
  BarChart3,
};

const iconThemeStyles = {
  rose: 'bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400',
  purple: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
};

export default function UpcomingTasks({ tasks = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Upcoming Tasks
        </h3>
        <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
          View All
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3.5">
        {tasks.map((task) => {
          const Icon = taskIcons[task.icon] || Calendar;
          const themeStyle =
            iconThemeStyles[task.iconTheme] || iconThemeStyles.purple;

          return (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 p-1 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
            >
              {/* Left: Icon & Task Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl ${themeStyle} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {task.subtitle}
                  </p>
                </div>
              </div>

              {/* Right: Due Date */}
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap pl-2">
                {task.due}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
