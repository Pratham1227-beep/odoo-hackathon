import React from 'react';
import { Search, ChevronDown, Filter, X } from 'lucide-react';

export default function ContractFilterBar({
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  onResetFilters,
  hasActiveFilters,
}) {
  const departments = [
    'All Departments',
    'Engineering',
    'Marketing',
    'Design',
    'Sales',
    'Finance',
    'HR',
    'Operations',
  ];

  const contractTypes = [
    'All Contract Types',
    'Permanent',
    'Fixed Term',
    'Probation',
    'Consultant',
    'Internship',
    'Part Time',
    'Temporary',
  ];

  const statuses = [
    'All Statuses',
    'Active',
    'Expiring Soon',
    'Expired',
    'Pending',
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by employee name, ID, or designation..."
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Select Filters & Filter Button */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Department Dropdown */}
        <div className="relative">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Contract Type Dropdown */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
          >
            {contractTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter / Reset Button */}
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}
