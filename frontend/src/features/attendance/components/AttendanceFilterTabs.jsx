import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Check, RotateCcw } from 'lucide-react';
import {
  departmentFilterOptions,
  statusFilterOptions,
  workLocationFilterOptions,
  attendanceTypeFilterOptions,
} from '../data/attendanceData';

export default function AttendanceFilterTabs({
  activeTab = 'All',
  onTabChange,
  counts = { all: 0, present: 0, absent: 0, leave: 0, late: 0 },
  searchQuery = '',
  onSearchChange,
  filters = {},
  onFilterChange,
  onResetFilters,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterPopoverRef = useRef(null);

  const tabs = [
    { id: 'All', label: 'All Employees' },
    { id: 'Present', label: `Present (${counts.present})` },
    { id: 'Absent', label: `Absent (${counts.absent})` },
    { id: 'On Leave', label: `On Leave (${counts.leave})` },
    { id: 'Late', label: `Late (${counts.late})` },
  ];

  const hasAdvancedFilters =
    (filters.department && filters.department !== 'All Departments') ||
    (filters.status && filters.status !== 'All Statuses') ||
    (filters.workLocation && filters.workLocation !== 'All Locations') ||
    (filters.attendanceType && filters.attendanceType !== 'All Types');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
      {/* Filter Tabs on Left */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`text-xs sm:text-sm whitespace-nowrap transition-all relative pb-3 cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Button on Right */}
      <div className="flex items-center gap-3">
        {/* Search Box */}
        <div className="relative w-full sm:w-60">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Popover Button */}
        <div className="relative" ref={filterPopoverRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs ${
              hasAdvancedFilters
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {hasAdvancedFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            )}
          </button>

          {/* Filter Popover Content */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Filter Attendance
                </span>
                {hasAdvancedFilters && (
                  <button
                    onClick={onResetFilters}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Department
                </label>
                <select
                  value={filters.department || 'All Departments'}
                  onChange={(e) => onFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {departmentFilterOptions.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Status
                </label>
                <select
                  value={filters.status || 'All Statuses'}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {statusFilterOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Location */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Work Location
                </label>
                <select
                  value={filters.workLocation || 'All Locations'}
                  onChange={(e) => onFilterChange('workLocation', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {workLocationFilterOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Attendance Type
                </label>
                <select
                  value={filters.attendanceType || 'All Types'}
                  onChange={(e) => onFilterChange('attendanceType', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {attendanceTypeFilterOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
