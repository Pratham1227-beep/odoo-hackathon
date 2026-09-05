import React from 'react';
import { X, Building2, CheckCircle2, FileSpreadsheet, Download } from 'lucide-react';

export default function PayrollPreviewModal({
  isOpen,
  onClose,
  period = 'September 2026',
  employees = [],
}) {
  if (!isOpen) return null;

  const totalGross = employees.reduce((sum, e) => sum + (e.grossSalary || 0), 0);
  const totalDeductions = employees.reduce((sum, e) => sum + (e.deductions || 0), 0);
  const totalNet = employees.reduce((sum, e) => sum + (e.netPay || 0), 0);

  // Group by department
  const deptMap = {};
  employees.forEach((e) => {
    if (!deptMap[e.department]) {
      deptMap[e.department] = { count: 0, gross: 0, deductions: 0, net: 0 };
    }
    deptMap[e.department].count += 1;
    deptMap[e.department].gross += e.grossSalary || 0;
    deptMap[e.department].deductions += e.deductions || 0;
    deptMap[e.department].net += e.netPay || 0;
  });

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Payroll Summary Preview — {period}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consolidated cost and statutory liability breakdown for {employees.length} employees
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Gross Payroll
              </span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                {formatINR(totalGross)}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Statutory Deductions
              </span>
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
                {formatINR(totalDeductions)}
              </span>
            </div>
            <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                Net Salary Disbursement
              </span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">
                {formatINR(totalNet)}
              </span>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Department-Wise Cost Allocation
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-center">Employees</th>
                    <th className="py-2.5 px-3 text-right">Gross Cost</th>
                    <th className="py-2.5 px-3 text-right">Deductions</th>
                    <th className="py-2.5 px-3 text-right">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(deptMap).map(([dept, data]) => (
                    <tr key={dept} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {dept}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500">
                        {data.count}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {formatINR(data.gross)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-medium">
                        {formatINR(data.deductions)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatINR(data.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs shadow-indigo-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Summary CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
