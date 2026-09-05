import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle,
  ShieldCheck,
  SlidersHorizontal,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { payrollModules } from '../data/payrollData';

export default function PayrollWorkflowModules() {
  const iconMap = {
    PlayCircle: PlayCircle,
    ShieldCheck: ShieldCheck,
    SlidersHorizontal: SlidersHorizontal,
    FileText: FileText,
  };

  const themeConfig = {
    purple: {
      border: 'hover:border-indigo-400 dark:hover:border-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/20',
    },
    amber: {
      border: 'hover:border-amber-400 dark:hover:border-amber-600',
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs shadow-amber-600/20',
    },
    blue: {
      border: 'hover:border-blue-400 dark:hover:border-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-600/20',
    },
    emerald: {
      border: 'hover:border-emerald-400 dark:hover:border-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20',
    },
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Payroll Workflow Engines
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step pipeline from compensation structure rules to verified payouts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {payrollModules.map((mod) => {
          const IconComp = iconMap[mod.icon] || PlayCircle;
          const styles = themeConfig[mod.theme] || themeConfig.purple;

          return (
            <div
              key={mod.id}
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all duration-200 ${styles.border} group`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg} transition-transform group-hover:scale-110`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${styles.badge}`}>
                    {mod.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {mod.countText}
                </span>

                <Link
                  to={mod.link}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${styles.btn}`}
                >
                  <span>{mod.buttonText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
