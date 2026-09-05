import React from 'react';
import { Users, Clock, TrendingUp, Award } from 'lucide-react';

export default function InternStats({ stats }) {
  const cards = [
    {
      title: 'Active Interns',
      value: stats?.active_interns ?? 0,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400',
    },
    {
      title: 'Ending Soon',
      value: stats?.ending_soon ?? 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
    },
    {
      title: 'Average Progress',
      value: `${stats?.average_progress ?? 0}%`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      title: 'Conversion Candidates',
      value: stats?.conversion_candidates ?? 0,
      icon: Award,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
