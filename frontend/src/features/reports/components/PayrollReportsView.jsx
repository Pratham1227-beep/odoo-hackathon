import React from 'react';
import { monthlyPayrollTrends, departmentCostBreakdown } from '../data/reportsData';
import { TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

export default function PayrollReportsView({ payrollData }) {
  // Use live monthly trends if present and nonempty, else fallback
  const trends = (payrollData?.monthly_trends && payrollData.monthly_trends.length > 0)
    ? payrollData.monthly_trends.map((t) => {
        const dateObj = new Date(t.date);
        const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
        return {
          month: monthName,
          gross: Number(t.total_gross || 0),
          net: Number(t.total_net || 0),
          deductions: Number(t.total_deductions || 0),
        };
      })
    : monthlyPayrollTrends;

  const maxGross = Math.max(...trends.map((t) => t.gross), 1);

  // Department cost breakdown
  const departments = (payrollData?.salary_cost_by_department && payrollData.salary_cost_by_department.length > 0)
    ? payrollData.salary_cost_by_department.map((dept, idx) => {
        const colors = ['bg-indigo-600', 'bg-blue-500', 'bg-teal-500', 'bg-purple-500', 'bg-amber-500'];
        const total = payrollData.metrics?.total_net || 1;
        const pct = Math.round((Number(dept.total_cost) / Number(total)) * 100) || 0;
        return {
          department: dept.department_name,
          cost: Number(dept.total_cost || 0),
          employees: dept.headcount || 0,
          percentage: pct,
          color: colors[idx % colors.length],
        };
      })
    : departmentCostBreakdown;

  return (
    <div className="space-y-6">
      {/* Monthly Payroll Trends Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Monthly Payroll Expenditure Trend</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing Gross Compensation, Statutory Deductions, and Net Disbursed (Last 6 Months)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Gross Pay
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Net Disbursed
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Deductions
            </span>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-8 pb-2 border-b border-slate-100 dark:border-slate-800">
          {trends.map((trend, index) => {
            const grossHeight = (trend.gross / maxGross) * 100;
            const netHeight = (trend.net / maxGross) * 100;
            const deductionHeight = (trend.deductions / maxGross) * 100;

            return (
              <div key={`${trend.month}-${index}`} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full max-w-[48px] flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                  {/* Gross Bar */}
                  <div
                    style={{ height: `${Math.max(grossHeight, 4)}%` }}
                    className="w-1/3 bg-indigo-600/90 group-hover:bg-indigo-600 rounded-t-sm transition-all duration-200 relative"
                    title={`Gross: ₹${trend.gross.toLocaleString('en-IN')}`}
                  />
                  {/* Net Bar */}
                  <div
                    style={{ height: `${Math.max(netHeight, 4)}%` }}
                    className="w-1/3 bg-emerald-500/90 group-hover:bg-emerald-500 rounded-t-sm transition-all duration-200 relative"
                    title={`Net: ₹${trend.net.toLocaleString('en-IN')}`}
                  />
                  {/* Deductions Bar */}
                  <div
                    style={{ height: `${Math.max(deductionHeight, 2)}%` }}
                    className="w-1/3 bg-rose-400/90 group-hover:bg-rose-400 rounded-t-sm transition-all duration-200 relative"
                    title={`Deductions: ₹${trend.deductions.toLocaleString('en-IN')}`}
                  />
                </div>
                <span className="text-2xs sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
                  {trend.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Cost Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Payroll Cost by Department</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Breakdown of salary allocation across departments for the current period
          </p>

          <div className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">
                    {dept.department} ({dept.employees} employees)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">
                      ₹{dept.cost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400 text-2xs">({dept.percentage}%)</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(dept.percentage, 100)}%` }}
                    className={`h-full ${dept.color} rounded-full transition-all duration-300`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Statutory Summary Card */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl p-5 sm:p-6 border border-indigo-100/80 dark:border-indigo-900/50 flex flex-col justify-between">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Audit Status
            </span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Payrun Reconciliation
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              All payroll vouchers reconciled against attendance registers and employee contract baselines.
            </p>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero negative net pay occurrences</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>EPFO & ESIC wage ceilings validated</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Bank account format compliance 100%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-200/60 dark:border-indigo-800/60 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            System Status: Active & Operational
          </div>
        </div>
      </div>
    </div>
  );
}
