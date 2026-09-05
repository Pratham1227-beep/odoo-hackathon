import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Coins, Activity, FileText, CalendarDays, BarChart3, ChevronRight } from 'lucide-react';

export default function AdminQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'settings',
      label: 'Organization Settings',
      description: 'Tenant profile, PAN, GSTIN & currency',
      route: '/settings',
      icon: Settings,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    },
    {
      id: 'payroll-config',
      label: 'Payroll Parameters',
      description: 'PF, ESIC rules & monthly cutoff dates',
      route: '/settings/payroll',
      icon: Coins,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
    },
    {
      id: 'activity',
      label: 'System Audit Trail',
      description: 'Live immutable event logs',
      route: '/notifications/activity',
      icon: Activity,
      color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
    },
    {
      id: 'contracts',
      label: 'Contracts Hub',
      description: 'Review expiries & active agreements',
      route: '/contracts',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    },
    {
      id: 'reports',
      label: 'Executive Reports',
      description: 'Payroll & workforce analytics',
      route: '/reports',
      icon: BarChart3,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Administrative Quick Actions
      </h3>

      <div className="space-y-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => navigate(act.route)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/60 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {act.label}
                  </h4>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 truncate">
                    {act.description}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
