import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, ChevronDown, Check } from 'lucide-react';

export default function PayrunTabs({
  activeTab = 'All',
  onSelectTab,
  tabCounts = { All: 118, Processed: 112, Pending: 6, 'On Hold': 0 },
  searchQuery = '',
  onSearchChange,
  departmentFilter = 'All',
  onDepartmentFilterChange,
  departments = [],
}) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'All', label: `All (${tabCounts.All ?? 0})` },
    { id: 'Processed', label: `Processed (${tabCounts.Processed ?? 0})` },
    { id: 'Pending', label: `Pending (${tabCounts.Pending ?? 0})` },
    { id: 'On Hold', label: `On Hold (${tabCounts['On Hold'] ?? 0})` },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-2 mb-4">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-all duration-150 whitespace-nowrap relative cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        {/* Search employees */}
        <div className="relative min-w-[220px] sm:min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        {/* Filter Button */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterMenuOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl border transition-colors cursor-pointer shadow-2xs ${
              departmentFilter !== 'All'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{departmentFilter === 'All' ? 'Filter' : departmentFilter}</span>
          </button>

          {/* Filter Dropdown Menu */}
          {filterMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Filter by Department
              </div>
              <button
                onClick={() => {
                  onDepartmentFilterChange('All');
                  setFilterMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                  departmentFilter === 'All'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>All Departments</span>
                {departmentFilter === 'All' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    onDepartmentFilterChange(dept);
                    setFilterMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                    departmentFilter === dept
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span>{dept}</span>
                  {departmentFilter === dept && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
