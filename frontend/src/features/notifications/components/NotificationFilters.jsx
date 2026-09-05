import React from 'react';
import { Calendar, ChevronDown, RotateCcw } from 'lucide-react';

export default function NotificationFilters({
  filters,
  onChangeFilter,
  onApplyFilters,
  onResetFilters,
  isFiltered,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Filters
        </h3>
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-3.5">
        {/* Date Range */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Date Range
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <select
              value={filters.dateRange}
              onChange={(e) => onChangeFilter('dateRange', e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 appearance-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="all">All Time</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Module */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Module
          </label>
          <div className="relative">
            <select
              value={filters.module}
              onChange={(e) => onChangeFilter('module', e.target.value)}
              className="w-full px-3.5 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 appearance-none cursor-pointer"
            >
              <option value="all">All Modules</option>
              <option value="employees">Employees</option>
              <option value="attendance">Attendance</option>
              <option value="leaveRequest">Leave Request</option>
              <option value="payroll">Payroll</option>
              <option value="workingSchedules">Working Schedules</option>
              <option value="contracts">Contracts</option>
              <option value="system">System</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Notification Type */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Notification Type
          </label>
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => onChangeFilter('type', e.target.value)}
              className="w-full px-3.5 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="approval">Approval</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="mention">Mention</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Status
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onChangeFilter('status', e.target.value)}
              className="w-full px-3.5 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 appearance-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <button
          type="button"
          onClick={onApplyFilters}
          className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
