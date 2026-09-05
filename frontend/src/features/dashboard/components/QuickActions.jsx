import React from 'react';
import { Plus, Calendar, FileText, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actionIcons = {
  'qa-add-employee': Plus,
  'qa-mark-attendance': Calendar,
  'qa-create-payslip': FileText,
  'qa-view-reports': BarChart2,
};

const actionStyles = {
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-100/80 dark:border-teal-900/60',
    iconBg: 'bg-teal-500 text-white',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-100/80 dark:border-purple-900/60',
    iconBg: 'bg-purple-500 text-white',
  },
  blue: {
    bg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-100/80 dark:border-sky-900/60',
    iconBg: 'bg-sky-500 text-white',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100/80 dark:border-amber-900/60',
    iconBg: 'bg-amber-500 text-white',
  },
};

export default function QuickActions({ actions = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Quick Actions
      </h3>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {actions.map((item) => {
          const Icon = actionIcons[item.id] || Plus;
          const style = actionStyles[item.colorTheme] || actionStyles.teal;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all duration-200 cursor-pointer space-y-2.5 text-center"
            >
              {/* Icon Circle */}
              <div
                className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>

              {/* Label */}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
