import React from 'react';
import { ClipboardList, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function LeaveRequestStats({
  totalRequests = 24,
  pendingCount = 12,
  approvedCount = 10,
  rejectedCount = 2,
}) {
  const cards = [
    {
      id: 'total',
      value: totalRequests,
      label: 'Total Requests',
      badge: '↑ 12%',
      badgeType: 'positive',
      subtext: null,
      icon: ClipboardList,
      iconBoxClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'pending',
      value: pendingCount,
      label: 'Pending Approval',
      badge: null,
      subtext: null,
      icon: Clock,
      iconBoxClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'approved',
      value: approvedCount,
      label: 'Approved',
      badge: '↑ 20%',
      badgeType: 'positive',
      subtext: 'This month',
      icon: CheckCircle2,
      iconBoxClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'rejected',
      value: rejectedCount,
      label: 'Rejected',
      badge: null,
      subtext: null,
      icon: XCircle,
      iconBoxClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm"
          >
            {/* Icon Container */}
            <div
              className={`w-13 h-13 rounded-2xl ${item.iconBoxClass} flex items-center justify-center shrink-0 shadow-2xs`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Numbers & Labels */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                  {item.value}
                </span>
                {item.badge && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {item.label}
                </p>
                {item.subtext && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                    {item.subtext}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
