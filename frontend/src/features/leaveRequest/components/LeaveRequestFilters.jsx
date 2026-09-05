import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Filter, ChevronDown, Check, RotateCcw, Search, X } from 'lucide-react';
import {
  leaveTypeOptions,
  departmentOptions,
  statusOptions,
} from '../data/leaveRequestData';

const monthOptions = [
  'Sep 2026',
  'Aug 2026',
  'Jul 2026',
  'Jun 2026',
  'All Months',
];

export default function LeaveRequestFilters({
  activeTab = 'All',
  onTabChange,
  counts = { all: 24, pending: 12, approved: 10, rejected: 2, cancelled: 0 },
  selectedMonth = 'Sep 2026',
  onMonthChange,
  searchQuery = '',
  onSearchChange,
  filters = {},
  onFilterChange,
  onResetFilters,
}) {
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const monthRef = useRef(null);
  const filterRef = useRef(null);

  const tabs = [
    { id: 'All', label: `All Requests (${counts.all})` },
    { id: 'Pending', label: `Pending (${counts.pending})` },
    { id: 'Approved', label: `Approved (${counts.approved})` },
    { id: 'Rejected', label: `Rejected (${counts.rejected})` },
    { id: 'Cancelled', label: `Cancelled (${counts.cancelled})` },
  ];

  const hasAdvancedFilters =
    (filters.leaveType && filters.leaveType !== 'All Types') ||
    (filters.status && filters.status !== 'All Statuses') ||
    (filters.department && filters.department !== 'All Departments') ||
    selectedMonth !== 'Sep 2026';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthRef.current && !monthRef.current.contains(event.target)) {
        setIsMonthOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
      {/* Tabs on Left */}
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

      {/* Date Selector + Filter + Search on Right */}
      <div className="flex items-center gap-2.5">
        {/* Search Box */}
        <div className="relative">
          {showSearch ? (
            <div className="relative w-48 sm:w-56 animate-in fade-in duration-150">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <button
                onClick={() => {
                  onSearchChange('');
                  setShowSearch(false);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200/80 dark:border-slate-800 cursor-pointer shadow-2xs"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date Selector Dropdown ("Sep 2026") */}
        <div className="relative" ref={monthRef}>
          <button
            onClick={() => setIsMonthOpen(!isMonthOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs transition-colors cursor-pointer"
            aria-label="Select month"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{selectedMonth}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMonthOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Month
              </div>
              {monthOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onMonthChange(m);
                    setIsMonthOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors text-left ${
                    selectedMonth === m
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{m}</span>
                  {selectedMonth === m && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Popover Button */}
        <div className="relative" ref={filterRef}>
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
                  Filter Leave Requests
                </span>
                {hasAdvancedFilters && (
                  <button
                    onClick={onResetFilters}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Leave Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Leave Type
                </label>
                <select
                  value={filters.leaveType || 'All Types'}
                  onChange={(e) => onFilterChange('leaveType', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {leaveTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
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
                  {departmentOptions.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
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
