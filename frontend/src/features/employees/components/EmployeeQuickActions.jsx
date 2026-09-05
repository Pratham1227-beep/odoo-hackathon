import React from 'react';
import { Calendar, Plane, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actionIcons = {
  'qa-mark-attendance': Calendar,
  'qa-apply-leave': Plane,
  'qa-view-payslips': FileText,
  'qa-download-documents': Download,
};

const actionStyles = {
  teal: {
    bg: 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-100/80 dark:border-teal-900/60',
    iconBg: 'bg-teal-500 text-white',
  },
  purple: {
    bg: 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-100/80 dark:border-purple-900/60',
    iconBg: 'bg-purple-500 text-white',
  },
  blue: {
    bg: 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-100/80 dark:border-sky-900/60',
    iconBg: 'bg-sky-500 text-white',
  },
  orange: {
    bg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-100/80 dark:border-amber-900/60',
    iconBg: 'bg-amber-500 text-white',
  },
};

export default function EmployeeQuickActions({ actions, employeeId }) {
  const navigate = useNavigate();

  const handleAction = (id) => {
    if (id === 'qa-mark-attendance') {
      navigate(`/attendance?employee=${employeeId}`);
    } else if (id === 'qa-apply-leave') {
      navigate(`/leave-management?employee=${employeeId}`);
    } else if (id === 'qa-view-payslips') {
      navigate(`/payroll?employee=${employeeId}`);
    } else if (id === 'qa-download-documents') {
      alert('Downloading consolidated employee documents package...');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Quick Actions
      </h3>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {actions.map((item) => {
          const Icon = actionIcons[item.id] || Calendar;
          const style = actionStyles[item.theme] || actionStyles.teal;

          return (
            <button
              key={item.id}
              onClick={() => handleAction(item.id)}
              className={`group flex flex-col items-center justify-center p-3.5 rounded-2xl border ${style.bg} hover:shadow-xs transition-all duration-200 cursor-pointer space-y-2 text-center`}
            >
              {/* Icon Circle */}
              <div
                className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>

              {/* Label */}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
