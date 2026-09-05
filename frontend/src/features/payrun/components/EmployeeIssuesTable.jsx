import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import EmployeeIssueRowActions from './EmployeeIssueRowActions';

export default function EmployeeIssuesTable({
  issues = [],
  totalIssuesCount = 6,
  searchQuery = '',
  onSearchChange,
  severityFilter = 'All',
  onSeverityFilterChange,
  departmentFilter = 'All',
  onDepartmentFilterChange,
  departments = [],
  onExportCSV,
  onActionClick,
  onViewEmployee,
  onResolve,
  onExclude,
}) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.ceil(issues.length / pageSize) || 1;
  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, issues.length);

  const paginatedIssues = issues.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const allVisibleSelected =
    paginatedIssues.length > 0 &&
    paginatedIssues.every((iss) => selectedIds.includes(iss.id));

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const pageIds = paginatedIssues.map((i) => i.id);
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-2xs overflow-hidden">
      {/* Header bar */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Employees with Issues ({totalIssuesCount})
          </h3>
        </div>

        {/* Search, Filter, Export controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search employee by name or ID..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                severityFilter !== 'All' || departmentFilter !== 'All'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {severityFilter !== 'All'
                  ? severityFilter
                  : departmentFilter !== 'All'
                  ? departmentFilter
                  : 'Filter'}
              </span>
            </button>

            {filterMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1.5 z-30 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Severity
                </div>
                {['All', 'Errors', 'Warnings'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => {
                      onSeverityFilterChange(sev);
                      setFilterMenuOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left cursor-pointer ${
                      severityFilter === sev
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sev === 'All' ? 'All Severities' : sev}</span>
                    {severityFilter === sev && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Department
                </div>
                <button
                  onClick={() => {
                    onDepartmentFilterChange('All');
                    setFilterMenuOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left cursor-pointer ${
                    departmentFilter === 'All'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>All Departments</span>
                  {departmentFilter === 'All' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
                {departments.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      onDepartmentFilterChange(d);
                      setFilterMenuOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left cursor-pointer ${
                      departmentFilter === d
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{d}</span>
                    {departmentFilter === d && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export button */}
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">
              <th className="py-3 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  aria-label="Select all"
                />
              </th>
              <th className="py-3 px-3">Employee</th>
              <th className="py-3 px-3">Employee ID</th>
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3">Issue Type</th>
              <th className="py-3 px-3">Details</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Action</th>
              <th className="py-3 pl-2 pr-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
            {paginatedIssues.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    No issues found
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    All employee records meet validation criteria or match your filter.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedIssues.map((iss) => {
                const isSelected = selectedIds.includes(iss.id);
                const isError = iss.severity === 'error';

                return (
                  <tr
                    key={iss.id}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(iss.id)}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                        aria-label={`Select ${iss.employeeName}`}
                      />
                    </td>

                    {/* Employee avatar + name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {iss.avatar ? (
                          <img
                            src={iss.avatar}
                            alt={iss.employeeName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              iss.avatarTheme === 'blue'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}
                          >
                            {iss.initials}
                          </div>
                        )}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {iss.employeeName}
                        </span>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-400">
                      {iss.employeeId}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {iss.department}
                    </td>

                    {/* Issue Type with icon */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium">
                        {isError ? (
                          <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                            <X className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <span
                          className={
                            isError
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }
                        >
                          {iss.issueType}
                        </span>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                      {iss.details}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      {isError ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                          Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                          Warning
                        </span>
                      )}
                    </td>

                    {/* Action Button: Update / Review */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => onActionClick(iss)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors cursor-pointer shadow-2xs ${
                          isError
                            ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                            : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                        }`}
                      >
                        {iss.action || (isError ? 'Update' : 'Review')}
                      </button>
                    </td>

                    {/* ⋮ Menu */}
                    <td className="py-3 pl-2 pr-4 text-right">
                      <EmployeeIssueRowActions
                        issue={iss}
                        onViewEmployee={onViewEmployee}
                        onResolve={onResolve}
                        onExclude={onExclude}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-medium">{issues.length > 0 ? startRow : 0}–{endRow}</span> of{' '}
          <span className="font-medium">{issues.length}</span> employees with issues
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                p === currentPage
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
