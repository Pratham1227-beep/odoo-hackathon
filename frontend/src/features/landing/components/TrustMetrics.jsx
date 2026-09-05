import React from 'react';
import { Building2, Users2, ShieldCheck, Star } from 'lucide-react';

export default function TrustMetrics() {
  const metrics = [
    {
      id: 'orgs',
      value: '500+',
      label: 'Organizations trust us',
      icon: Building2,
      iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400',
    },
    {
      id: 'employees',
      value: '50,000+',
      label: 'Employees managed',
      icon: Users2,
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400',
    },
    {
      id: 'accuracy',
      value: '99.9%',
      label: 'Payroll accuracy',
      icon: ShieldCheck,
      iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400',
    },
    {
      id: 'satisfaction',
      value: '4.8/5',
      label: 'Customer satisfaction',
      icon: Star,
      iconBg: 'bg-teal-100 text-teal-600 dark:bg-teal-950/80 dark:text-teal-400',
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {metrics.map((metric, idx) => {
            const IconComponent = metric.icon;
            const isLast = idx === metrics.length - 1;

            return (
              <div
                key={metric.id}
                className={`flex items-center justify-start sm:justify-center gap-4 px-6 py-4 ${
                  !isLast ? 'lg:border-r border-slate-100 dark:border-slate-800' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${metric.iconBg}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                    {metric.value}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
