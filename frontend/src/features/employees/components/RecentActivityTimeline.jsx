import React from 'react';

const dotColorStyles = {
  teal: 'bg-teal-500 ring-teal-100 dark:ring-teal-950',
  rose: 'bg-rose-500 ring-rose-100 dark:ring-rose-950',
  purple: 'bg-indigo-600 ring-indigo-100 dark:ring-indigo-950',
};

export default function RecentActivityTimeline({ activities = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
          View All
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-4 relative">
        {activities.map((item) => {
          const dotStyle = dotColorStyles[item.theme] || dotColorStyles.teal;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 text-xs"
            >
              {/* Left: Dot & Activity Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ring-4 ${dotStyle}`}
                />
                <span className="font-semibold text-slate-900 dark:text-white truncate">
                  {item.text}
                </span>
              </div>

              {/* Right: Date */}
              <span className="text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap pl-2">
                {item.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
