import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, UserCheck } from 'lucide-react';
import { employeeService } from '../../employees/services/employeeService';

export default function ScheduleStats({ totalCount }) {
  const [liveCount, setLiveCount] = useState(totalCount || 0);

  useEffect(() => {
    if (totalCount !== undefined) {
      setLiveCount(totalCount);
    } else {
      employeeService.getEmployeeStats().then((res) => {
        if (res?.total_employees !== undefined) {
          setLiveCount(res.total_employees);
        }
      }).catch(() => {});
    }
  }, [totalCount]);

  const scheduleKPIs = [
    {
      id: 'total-employees',
      title: 'Total Employees',
      value: String(liveCount || 0),
      subtitle: 'Across all schedules',
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    },
    {
      id: 'active-schedules',
      title: 'Active Schedules',
      value: '3',
      subtitle: 'Currently in use',
      icon: Calendar,
      iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
    },
    {
      id: 'shift-types',
      title: 'Shift Types',
      value: '3',
      subtitle: 'Morning, Evening, Night',
      icon: Clock,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    },
    {
      id: 'rotational-employees',
      title: 'Rotational Employees',
      value: String(Math.min(liveCount, 2)),
      subtitle: 'On Flexible / Rotational Shift',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {scheduleKPIs.map((kpi) => {
        const IconComponent = kpi.icon;

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
