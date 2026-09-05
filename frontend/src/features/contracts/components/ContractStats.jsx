import React from 'react';
import { Users, FileCheck, Clock, FileX } from 'lucide-react';

export default function ContractStats({ stats }) {
  const iconMap = {
    Users: Users,
    FileCheck: FileCheck,
    Clock: Clock,
    FileX: FileX,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const IconComp = iconMap[stat.icon] || Users;

        return (
          <div
            key={stat.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${stat.iconBg}`}
              >
                <IconComp className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </span>
                  {stat.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stat.badgeColor}`}
                    >
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {stat.title}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  {stat.subtitle}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
