import React from 'react';
import { Palmtree, PlusSquare, User, Heart } from 'lucide-react';

const iconConfig = {
  Palmtree: { icon: Palmtree, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
  Cross: { icon: PlusSquare, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/60' },
  User: { icon: User, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/60' },
  Heart: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/60' },
};

export default function LeaveBalance({ balances = [], onViewAll }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Leave Balance
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Balances List */}
      <div className="space-y-4">
        {balances.map((item) => {
          const cfg = iconConfig[item.icon] || iconConfig.Palmtree;
          const IconComp = cfg.icon;
          const pct = Math.min(100, Math.round((item.used / (item.total || 1)) * 100));

          return (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                {/* Left: Icon + Name */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>

                {/* Right: Used / Total */}
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">{item.used}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500"> / {item.total} {item.unit}</span>
                </div>
              </div>

              {/* Progress Bar (WageWise Purple) */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
