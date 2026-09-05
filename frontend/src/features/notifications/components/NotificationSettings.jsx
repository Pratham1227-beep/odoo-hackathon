import React from 'react';
import { Mail, Smartphone, FileText, Calendar, Settings, ArrowRight } from 'lucide-react';

export default function NotificationSettings({
  settings,
  onToggleSetting,
  onManageAllSettings,
}) {
  const items = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive important updates via email',
      icon: Mail,
      iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      id: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Get notified in real-time',
      icon: Smartphone,
      iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
    },
    {
      id: 'payrollUpdates',
      title: 'Payroll Updates',
      description: 'Notifications about payroll activities',
      icon: FileText,
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
    },
    {
      id: 'leaveRequests',
      title: 'Leave Requests',
      description: 'Notifications about leave approvals',
      icon: Calendar,
      iconColor: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40',
    },
    {
      id: 'systemUpdates',
      title: 'System Updates',
      description: 'Product updates and maintenance',
      icon: Settings,
      iconColor: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
        Notification Settings
      </h3>

      <div className="space-y-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isEnabled = !!settings[item.id];

          return (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.iconColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 truncate">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => onToggleSetting(item.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Manage All Settings Link */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onManageAllSettings}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer group"
        >
          <span>Manage All Settings</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
