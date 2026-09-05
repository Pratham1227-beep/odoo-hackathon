import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function CompanyHolidaysCard({
  holidays = [],
  onViewAll,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Company Holidays
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Holidays List */}
      <div className="space-y-3">
        {holidays.slice(0, 3).map((h, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 py-1 border-b border-slate-50 dark:border-slate-800/50 last:border-none"
          >
            <span className="text-slate-900 dark:text-white font-semibold">
              {formatDate(h.date)}
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-right">
              {h.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
