import React from 'react';
import { Users, Calendar, Clock, UserCheck } from 'lucide-react';
import { scheduleKPIs } from '../data/workingScheduleData';

export default function ScheduleStats() {
  const iconMap = {
    Users: Users,
    Calendar: Calendar,
    Clock: Clock,
    UserCheck: UserCheck,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {scheduleKPIs.map((kpi) => {
        const IconComponent = iconMap[kpi.icon] || Users;

        return (
          <div
            key={kpi.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${kpi.iconBg}`}
            >
              <IconComponent className="w-6 h-6" />
            </div>

            <div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {kpi.value}
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {kpi.title}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                {kpi.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
