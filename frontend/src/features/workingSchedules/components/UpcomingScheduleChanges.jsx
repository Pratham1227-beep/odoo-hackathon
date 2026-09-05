import React from 'react';
import { Calendar, RotateCw, Clock } from 'lucide-react';
import { upcomingScheduleChanges } from '../data/workingScheduleData';

export default function UpcomingScheduleChanges({ onViewAll }) {
  const iconMap = {
    Calendar: Calendar,
    RotateCw: RotateCw,
    Clock: Clock,
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Upcoming Schedule Changes
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {upcomingScheduleChanges.map((item) => {
          const IconComp = iconMap[item.icon] || Calendar;

          return (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap mt-0.5">
                {item.date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
