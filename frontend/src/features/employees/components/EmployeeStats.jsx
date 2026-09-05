import React from 'react';
import {
  Users,
  UserCheck,
  UserMinus,
  UserPlus,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const iconMap = {
  Users,
  UserCheck,
  UserMinus,
  UserPlus,
};

const themeStyles = {
  purple: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400',
    trendColor: 'text-emerald-600 dark:text-emerald-400',
    trendIcon: TrendingUp,
  },
  teal: {
    iconBg: 'bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400',
    trendColor: 'text-emerald-600 dark:text-emerald-400',
    trendIcon: TrendingUp,
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400',
    trendColor: 'text-amber-600 dark:text-amber-400',
    trendIcon: AlertTriangle,
  },
  violet: {
    iconBg: 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400',
    trendColor: 'text-emerald-600 dark:text-emerald-400',
    trendIcon: TrendingUp,
  },
};

export default function EmployeeStats({ kpis = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {kpis.map((item) => {
        const IconComponent = iconMap[item.icon] || Users;
        const theme = themeStyles[item.theme] || themeStyles.purple;
        const TrendIcon = theme.trendIcon;

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-4"
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center shrink-0`}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            {/* Details */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.title}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {item.value}
              </h3>
              <div
                className={`flex items-center gap-1 text-[11px] font-semibold ${theme.trendColor}`}
              >
                <TrendIcon className="w-3 h-3" />
                <span>{item.trend}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
