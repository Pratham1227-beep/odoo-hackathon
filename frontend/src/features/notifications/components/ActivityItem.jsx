import React from 'react';
import {
  Receipt,
  CalendarCheck,
  User,
  UserPlus,
  CalendarClock,
  FileText,
  CheckCircle,
  Settings,
  Activity,
} from 'lucide-react';

export default function ActivityItem({ activity, isLast = false }) {
  const renderIcon = () => {
    const iconClass = 'w-3.5 h-3.5';
    switch (activity.icon) {
      case 'Receipt':
        return <Receipt className={iconClass} />;
      case 'CalendarCheck':
        return <CalendarCheck className={iconClass} />;
      case 'User':
        return <User className={iconClass} />;
      case 'UserPlus':
        return <UserPlus className={iconClass} />;
      case 'CalendarClock':
        return <CalendarClock className={iconClass} />;
      case 'FileText':
        return <FileText className={iconClass} />;
      case 'CheckCircle':
        return <CheckCircle className={iconClass} />;
      case 'Settings':
        return <Settings className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  return (
    <div className="relative flex items-start gap-3.5 pb-4.5 last:pb-0">
      {/* Vertical Connecting Line */}
      {!isLast && (
        <span
          className="absolute left-4 top-8 -bottom-1 w-0.5 bg-slate-200 dark:bg-slate-800"
          aria-hidden="true"
        />
      )}

      {/* Node Icon Circle */}
      <div
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${activity.iconColor}`}
      >
        {renderIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
          {activity.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
          {activity.description}
        </p>
        <p className="text-2xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          {activity.time}
        </p>
      </div>
    </div>
  );
}
