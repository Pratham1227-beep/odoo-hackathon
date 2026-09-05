import React from 'react';

const statusBadgeStyles = {
  success:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60',
  warning:
    'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100 dark:border-amber-800/60',
  info:
    'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/60',
};

export default function RecentActivityTable({ activities = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Activity</th>
              <th className="pb-3 font-semibold">Details</th>
              <th className="pb-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
            {activities.map((item) => {
              const badgeStyle =
                statusBadgeStyles[item.statusVariant] || statusBadgeStyles.info;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Date */}
                  <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    {item.date}
                  </td>

                  {/* Activity */}
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {item.activity}
                  </td>

                  {/* Details */}
                  <td className="py-3.5 text-slate-600 dark:text-slate-300">
                    {item.details}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${badgeStyle}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
