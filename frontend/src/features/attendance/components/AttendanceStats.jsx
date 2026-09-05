import React from 'react';
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AttendanceStats({
  totalEmployees = 0,
  presentCount = 0,
  absentCount = 0,
  leaveCount = 0,
}) {
  const presentPct = totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(1) : 0;
  const absentPct = totalEmployees > 0 ? ((absentCount / totalEmployees) * 100).toFixed(1) : 0;
  const leavePct = totalEmployees > 0 ? ((leaveCount / totalEmployees) * 100).toFixed(1) : 0;

  const stats = [
    {
      id: 'total',
      label: 'Total Employees',
      value: totalEmployees,
      badge: null,
      icon: Users,
      iconBoxClass: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400',
    },
    {
      id: 'present',
      label: 'Present Today',
      value: presentCount,
      badge: {
        text: `${presentPct}%`,
        className: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60',
      },
      icon: CheckCircle2,
      iconBoxClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'absent',
      label: 'Absent Today',
      value: absentCount,
      badge: {
        text: `${absentPct}%`,
        className: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60',
      },
      icon: XCircle,
      iconBoxClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'leave',
      label: 'On Leave',
      value: leaveCount,
      badge: {
        text: `${leavePct}%`,
        className: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60',
      },
      icon: Clock,
      iconBoxClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((item) => {
        const Icon = item.icon;
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

            {/* Numbers & Label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                  {item.value}
                </span>
                {item.badge && (
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${item.badge.className}`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
