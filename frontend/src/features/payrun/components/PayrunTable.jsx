import React from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import PayrunRowActions from './PayrunRowActions';

export default function PayrunTable({
  employees = [],
  totalEmployeesCount = 118,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  currentPage = 1,
  pageSize = 8,
  onPageChange,
  onViewPayslip,
  onRecalculate,
  onToggleHold,
  onViewEmployee,
  onRemove,
}) {
  const totalPages = Math.ceil(totalEmployeesCount / pageSize) || 1;
  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalEmployeesCount);

  const allVisibleSelected =
    employees.length > 0 &&
    employees.every((emp) => selectedIds.includes(emp.id));
  const someVisibleSelected =
    employees.some((emp) => selectedIds.includes(emp.id)) && !allVisibleSelected;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const renderPaginationButtons = () => {
    const pages = [];
    const maxButtons = 5;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(p);
    }

    return (
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Ellipsis if needed */}
        {endPage < totalPages && (
          <>
            <span className="text-slate-400 px-1 text-xs">...</span>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-12 text-center shadow-2xs">
        <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No employees match criteria
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adjust your active filter tab or clear search query to view payroll records.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-2xs overflow-hidden">
      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[880px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">
              <th className="py-3.5 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someVisibleSelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 text-indigo-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                  aria-label="Select all visible employees"
                />
              </th>
              <th className="py-3.5 px-3 font-semibold">Employee</th>
              <th className="py-3.5 px-3 font-semibold">Employee ID</th>
              <th className="py-3.5 px-3 font-semibold">Department</th>
              <th className="py-3.5 px-3 font-semibold">Gross Salary</th>
              <th className="py-3.5 px-3 font-semibold">Deductions</th>
              <th className="py-3.5 px-3 font-semibold">Net Pay</th>
              <th className="py-3.5 px-3 font-semibold">Status</th>
              <th className="py-3.5 pl-3 pr-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
            {employees.map((emp) => {
              const isSelected = selectedIds.includes(emp.id);

              return (
                <tr
                  key={emp.id}
                  className={`transition-colors group ${
                    isSelected
                      ? 'bg-indigo-50/30 dark:bg-indigo-950/20'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="py-3 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(emp.id)}
                      className="w-4 h-4 text-indigo-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                      aria-label={`Select ${emp.name}`}
                    />
                  </td>

                  {/* Employee Name + Avatar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            emp.avatarTheme === 'blue'
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {emp.initials}
                        </div>
                      )}
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {emp.name}
                      </span>
                    </div>
                  </td>

                  {/* Employee ID */}
                  <td className="py-3 px-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {emp.id}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {emp.department}
                  </td>

                  {/* Gross Salary */}
                  <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-200">
                    {formatCurrency(emp.grossSalary)}
                  </td>

                  {/* Deductions */}
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-medium">
                    {formatCurrency(emp.deductions)}
                  </td>

                  {/* Net Pay */}
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(emp.netPay)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    {emp.status === 'Processed' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                        Processed
                      </span>
                    )}
                    {emp.status === 'Pending' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                        Pending
                      </span>
                    )}
                    {emp.status === 'On Hold' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        On Hold
                      </span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="py-3 pl-3 pr-4 text-right">
                    <PayrunRowActions
                      employee={emp}
                      onViewPayslip={onViewPayslip}
                      onRecalculate={onRecalculate}
                      onToggleHold={onToggleHold}
                      onViewEmployee={onViewEmployee}
                      onRemove={onRemove}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-medium">{totalEmployeesCount > 0 ? startRow : 0}–{endRow}</span> of{' '}
          <span className="font-medium">{totalEmployeesCount}</span> employees
        </p>

        {renderPaginationButtons()}
      </div>
    </div>
  );
}
