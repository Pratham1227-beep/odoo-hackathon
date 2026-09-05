import React, { useState } from 'react';
import { ChevronDown, ArrowRight, Activity } from 'lucide-react';
import ActivityItem from './ActivityItem';

export default function RecentActivity({
  activities = [],
  onViewAllActivity,
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filterOptions = [
    { id: 'all', label: 'All Activities' },
    { id: 'employee', label: 'Employee Activity' },
    { id: 'payroll', label: 'Payroll Activity' },
    { id: 'leave', label: 'Leave Activity' },
    { id: 'attendance', label: 'Attendance Activity' },
    { id: 'contract', label: 'Contract Activity' },
    { id: 'system', label: 'System Activity' },
  ];

  const filteredActivities =
    selectedFilter === 'all'
      ? activities
      : activities.filter((act) => act.type === selectedFilter);

  const currentLabel =
    filterOptions.find((opt) => opt.id === selectedFilter)?.label || 'All Activities';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h2>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>{currentLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(opt.id);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedFilter === opt.id
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="space-y-0.5">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={index === filteredActivities.length - 1}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No activity records found for this category
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Link: View All Activity → */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <button
          type="button"
          onClick={onViewAllActivity}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer group"
        >
          <span>View All Activity</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
