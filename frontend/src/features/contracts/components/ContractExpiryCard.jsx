import React from 'react';
import { upcomingContractExpirations } from '../data/contractsData';

export default function ContractExpiryCard({
  onSelectEmployeeExpiry,
  onViewAllExpirations,
}) {
  const getBadgeClass = (urgency) => {
    switch (urgency) {
      case 'high': // < 30 days
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
      case 'medium': // 30-90 days
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      default: // > 90 days
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
          Upcoming Contract Expirations
        </h3>
        <button
          type="button"
          onClick={onViewAllExpirations}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* List */}
      <div className="space-y-3.5">
        {upcomingContractExpirations.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectEmployeeExpiry(item.employeeId)}
            className="flex items-center justify-between gap-3 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.employeeName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    item.avatarBg || 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {item.initials || 'EM'}
                </div>
              )}

              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.employeeName}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {item.employeeId} • {item.designation}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {item.expiryDate}
                </div>
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${getBadgeClass(
                item.urgency
              )}`}
            >
              {item.daysText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
