import React from 'react';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function TimeOffStats({
  pendingCount = 12,
  approvedCount = 48,
  rejectedCount = 5,
  upcomingCount = 18,
}) {
  const stats = [
    {
      id: 'pending',
      value: pendingCount,
      label: 'Pending Requests',
      icon: Calendar,
      subIcon: Clock,
      iconBoxClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'approved',
      value: approvedCount,
      label: 'Approved (This Month)',
      icon: CheckCircle2,
      iconBoxClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'rejected',
      value: rejectedCount,
      label: 'Rejected (This Month)',
      icon: XCircle,
      iconBoxClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'upcoming',
      value: upcomingCount,
      label: 'Upcoming Time Off',
      icon: Calendar,
      iconBoxClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((item) => {
        const Icon = item.icon;
        const SubIcon = item.subIcon;
        return (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm"
          >
            {/* Icon Container */}
            <div
              className={`w-13 h-13 rounded-2xl ${item.iconBoxClass} flex items-center justify-center shrink-0 shadow-2xs`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Value & Label */}
            <div className="flex-1 min-w-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none block">
                {item.value}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {SubIcon && <SubIcon className="w-3.5 h-3.5 text-slate-400" />}
                <span>{item.label}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
