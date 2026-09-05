import React from 'react';
import { CalendarCheck, Plane, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  CalendarCheck,
  Plane,
  XCircle,
  Clock,
};

const themeStyles = {
  teal: {
    bg: 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  amber: {
    bg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  purple: {
    bg: 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
};

export default function LeaveAttendanceSummary({ data, employeeId }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Leave & Attendance{' '}
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
            ({data.month})
          </span>
        </h3>
        <button
          onClick={() => navigate(`/attendance?employee=${employeeId}`)}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.metrics.map((item) => {
          const IconComponent = iconMap[item.icon] || CalendarCheck;
          const style = themeStyles[item.theme] || themeStyles.teal;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border ${style.bg} flex flex-col items-center justify-center text-center space-y-1.5 transition-all`}
            >
              <div className="flex items-center gap-2">
                <IconComponent className={`w-4 h-4 ${style.iconColor}`} />
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {item.count}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
