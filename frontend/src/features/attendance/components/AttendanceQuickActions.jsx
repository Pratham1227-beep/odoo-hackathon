import React from 'react';
import { CalendarCheck, Plane, FileText, Download } from 'lucide-react';

export default function AttendanceQuickActions({
  onMarkAttendance,
  onApplyLeave,
  onViewReports,
  onExportData,
}) {
  const actions = [
    {
      id: 'mark-attendance',
      title: 'Mark Attendance',
      icon: CalendarCheck,
      iconClass: 'text-teal-600 dark:text-teal-400',
      bgClass: 'bg-teal-50/60 dark:bg-teal-950/30 hover:bg-teal-100/60 dark:hover:bg-teal-950/50 border-teal-100/60 dark:border-teal-900/40',
      onClick: onMarkAttendance,
    },
    {
      id: 'apply-leave',
      title: 'Apply Leave',
      icon: Plane,
      iconClass: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/50 border-indigo-100/60 dark:border-indigo-900/40',
      onClick: onApplyLeave,
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      icon: FileText,
      iconClass: 'text-sky-600 dark:text-sky-400',
      bgClass: 'bg-sky-50/60 dark:bg-sky-950/30 hover:bg-sky-100/60 dark:hover:bg-sky-950/50 border-sky-100/60 dark:border-sky-900/40',
      onClick: onViewReports,
    },
    {
      id: 'export-data',
      title: 'Export Data',
      icon: Download,
      iconClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-950/50 border-amber-100/60 dark:border-amber-900/40',
      onClick: onExportData,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Quick Actions
        </h3>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className={`p-4 rounded-2xl border ${act.bgClass} flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] focus:outline-none`}
            >
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                <Icon className={`w-5 h-5 ${act.iconClass}`} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {act.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
