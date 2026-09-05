import React, { useState, useEffect } from 'react';
import { Coins, PlayCircle, Landmark, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import { payrollKPIs } from '../data/payrollData';
import { payrollService } from '../services/payrollService';
import { mapDashboardToKpis } from '../utils/payrollMappers';

export default function PayrollKPIs() {
  const [kpis, setKpis] = useState(payrollKPIs);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const dashboard = await payrollService.getDashboard();
        if (dashboard) {
          const mapped = mapDashboardToKpis(dashboard);
          if (mapped && mapped.length > 0) {
            setKpis(mapped);
          }
        }
      } catch (err) {
        // Retain initial fallback KPIs
        console.warn('Dashboard KPIs fallback note:', err.message);
      }
    };

    fetchKPIs();
  }, []);

  const iconMap = {
    Coins: Coins,
    PlayCircle: PlayCircle,
    Landmark: Landmark,
    ShieldAlert: ShieldAlert,
  };

  const themeStyles = {
    purple: {
      bgIcon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
    },
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
    },
    blue: {
      bgIcon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
    },
    amber: {
      bgIcon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => {
        const IconComponent = iconMap[kpi.icon] || Coins;
        const styles = themeStyles[kpi.theme] || themeStyles.purple;

        return (
          <div
            key={kpi.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                {kpi.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${styles.bgIcon}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {kpi.value}
              </span>
              {kpi.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}
                >
                  {kpi.badge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {kpi.trend && (
                <span
                  className={`inline-flex items-center gap-0.5 font-medium ${
                    kpi.trendType === 'positive'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {kpi.trendType === 'positive' && <TrendingUp className="w-3.5 h-3.5" />}
                  {kpi.trend}
                </span>
              )}
              {kpi.subtitle && !kpi.trend && (
                <span className="text-slate-500 dark:text-slate-400 truncate">
                  {kpi.subtitle}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
