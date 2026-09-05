import React, { useState } from 'react';
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import {
  departmentOptions,
  employmentTypeOptions,
  statusOptions
} from '../data/employeesData';

export default function EmployeeFilterBar({
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedEmploymentType,
  onEmploymentTypeChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  hasActiveFilters,
}) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  return (
    <div className="space-y-3 pb-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns & Action Button */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Department Select */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
            >
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All Departments' ? 'Department' : dept}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Employment Type Select */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedEmploymentType}
              onChange={(e) => onEmploymentTypeChange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
            >
              {employmentTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type === 'All Types' ? 'Employment Type' : type}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Select */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st === 'All Statuses' ? 'Status' : st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* More Filters Button */}
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shrink-0 ${
              showMoreFilters || hasActiveFilters
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Expanded Active Filters Pill Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Active Filters:
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-indigo-900 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedDepartment !== 'All Departments' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
              <span>Dept: {selectedDepartment}</span>
              <button
                onClick={() => onDepartmentChange('All Departments')}
                className="hover:text-indigo-900 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedEmploymentType !== 'All Types' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
              <span>Type: {selectedEmploymentType}</span>
              <button
                onClick={() => onEmploymentTypeChange('All Types')}
                className="hover:text-indigo-900 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedStatus !== 'All Statuses' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
              <span>Status: {selectedStatus}</span>
              <button
                onClick={() => onStatusChange('All Statuses')}
                className="hover:text-indigo-900 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
