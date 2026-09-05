import React from 'react';
import { Coins, Users, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function ReportStats({ kpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Total Payroll Cost */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Payroll Cost
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {kpis.totalPayrollCost}
          </h3>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{kpis.payrollCostChange} from last month</span>
          </p>
        </div>
      </div>

      {/* Active Workforce */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Active Workforce
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {kpis.totalEmployees} Employees
          </h3>
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{kpis.employeesChange}</span>
          </p>
        </div>
      </div>

      {/* Attendance Rate */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Avg. Attendance Rate
          </span>
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {kpis.averageAttendanceRate}
          </h3>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{kpis.attendanceChange} punctual index</span>
          </p>
        </div>
      </div>

      {/* Statutory Compliance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Statutory Compliance
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {kpis.statutoryCompliance}
          </h3>
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">
            {kpis.complianceStatus} (PF, ESI, PT, TDS)
          </p>
        </div>
      </div>
    </div>
  );
}
