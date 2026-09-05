import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  PieChart,
  Landmark,
  FileCheck,
} from 'lucide-react';
import {
  monthlyDisbursementTrends,
  departmentCostBreakdown,
  statutoryComplianceItems,
} from '../data/payrollData';

export default function PayrollTrendsAndCompliance() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCompliance = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const maxGross = Math.max(...monthlyDisbursementTrends.map((d) => d.gross));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* Left 7 Columns: Financial Trends & Department Distribution */}
      <div className="lg:col-span-7 space-y-6">
        {/* Monthly Disbursement Trends */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Monthly Payout Trajectory (Gross vs Net)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Past 6 months payroll disbursement across all active employees.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span> Gross
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Net Paid
              </span>
            </div>
          </div>

          {/* Bar Visualizer */}
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            {monthlyDisbursementTrends.map((item) => {
              const grossHeight = Math.round((item.gross / maxGross) * 100);
              const netHeight = Math.round((item.net / maxGross) * 100);

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{item.gross}L
                  </div>
                  <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-32">
                    {/* Gross Bar */}
                    <div
                      style={{ height: `${grossHeight}%` }}
                      className={`w-1/2 rounded-t-md transition-all duration-300 ${
                        item.current
                          ? 'bg-indigo-600 shadow-sm shadow-indigo-600/30'
                          : 'bg-indigo-300 dark:bg-indigo-900/60 group-hover:bg-indigo-500'
                      }`}
                      title={`Gross: ₹${item.gross}L`}
                    />
                    {/* Net Bar */}
                    <div
                      style={{ height: `${netHeight}%` }}
                      className={`w-1/2 rounded-t-md transition-all duration-300 ${
                        item.current
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                          : 'bg-emerald-300 dark:bg-emerald-900/60 group-hover:bg-emerald-400'
                      }`}
                      title={`Net: ₹${item.net}L`}
                    />
                  </div>
                  <span
                    className={`text-[11px] mt-1 ${
                      item.current
                        ? 'font-bold text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3">
            <span>Current Batch: 118 Employees</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Avg. Net Payout: ₹69,067 / employee
            </span>
          </div>
        </div>

        {/* Department Cost Allocation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department Cost Distribution
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total: ₹91.44L
            </span>
          </div>

          <div className="space-y-3">
            {departmentCostBreakdown.map((dept) => (
              <div key={dept.department} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {dept.department} ({dept.count} members)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {dept.amountFormatted}
                    </span>
                    <span className="text-slate-400">({dept.percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${dept.percentage}%` }}
                    className={`h-full rounded-full ${dept.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right 5 Columns: Statutory Tax Compliance & Banking Gate */}
      <div className="lg:col-span-5 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Statutory & Bank Filings
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Reconciled
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Government tax remittances, EPFO deductions, and bulk bank transfer batch files.
          </p>

          <div className="space-y-3">
            {statutoryComplianceItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white shrink-0">
                    {item.amount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Due: {item.dueDate}
                  </span>
                  <span
                    className={`font-semibold ${
                      item.statusType === 'success'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action card at bottom */}
        <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Bulk Bank Payout & Tax Package
              </p>
              <p className="text-[11px] text-slate-400">
                Download verified ECR, TDS, and NACH files
              </p>
            </div>

            <button
              onClick={handleExportCompliance}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Pack</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
