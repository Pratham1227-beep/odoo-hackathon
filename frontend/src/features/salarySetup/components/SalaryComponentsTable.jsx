import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export default function SalaryComponentsTable({
  allowances,
  deductions,
  onAddAllowance,
  onAddDeduction,
  onEditComponent,
  onDeleteComponent,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close context menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatAmount = (amt) => {
    const val = Number(amt) || 0;
    return val.toLocaleString('en-IN');
  };

  return (
    <div className="space-y-4 pt-2">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Salary Components
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Allowances Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 px-4 py-3 flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
              Allowances
            </h4>
            <button
              type="button"
              onClick={onAddAllowance}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Allowance</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                  <th className="px-4 py-3">Component</th>
                  <th className="px-4 py-3 text-right">Amount (₹)</th>
                  <th className="w-10 px-3 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {allowances.map((item) => {
                  const isMenuOpen = activeMenuId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-100 tabular-nums">
                        {formatAmount(item.amount)}
                      </td>
                      <td className="px-3 py-3 text-center relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : item.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute right-3 top-9 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onEditComponent(item, 'allowance');
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left font-medium"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteComponent(item.id, 'allowance');
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {allowances.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-xs text-slate-400"
                    >
                      No allowances added. Click "+ Add Allowance" to configure.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deductions Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-rose-50/80 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/40 px-4 py-3 flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">
              Deductions
            </h4>
            <button
              type="button"
              onClick={onAddDeduction}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Deduction</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                  <th className="px-4 py-3">Component</th>
                  <th className="px-4 py-3 text-right">Amount (₹)</th>
                  <th className="w-10 px-3 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {deductions.map((item) => {
                  const isMenuOpen = activeMenuId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-100 tabular-nums">
                        {formatAmount(item.amount)}
                      </td>
                      <td className="px-3 py-3 text-center relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : item.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute right-3 top-9 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onEditComponent(item, 'deduction');
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left font-medium"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteComponent(item.id, 'deduction');
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {deductions.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-xs text-slate-400"
                    >
                      No deductions added. Click "+ Add Deduction" to configure.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
