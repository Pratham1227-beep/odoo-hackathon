import React from 'react';
import { attendanceReportData } from '../data/reportsData';
import { Clock, AlertCircle } from 'lucide-react';

export default function AttendanceReportsView({ attendanceData }) {
  // Use live department breakdown from attendance data if available
  const rows = (attendanceData?.department_breakdown && attendanceData.department_breakdown.length > 0)
    ? attendanceData.department_breakdown.map((item) => {
        const total = (item.present_count + item.late_count + item.absent_count + item.half_day_count) || 1;
        const presentPct = Math.round((item.present_count / total) * 100);
        const latePct = Math.round((item.late_count / total) * 100);
        const absentPct = Math.round((item.absent_count / total) * 100);

        return {
          department: item.department_name,
          present: presentPct,
          late: latePct,
          absent: absentPct,
          overtimeHours: item.total_overtime_hours || 0,
        };
      })
    : attendanceReportData;

  const totalOvertime = attendanceData?.total_overtime_hours !== undefined
    ? attendanceData.total_overtime_hours
    : rows.reduce((acc, curr) => acc + curr.overtimeHours, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Department Attendance & Punctuality Register</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated monthly attendance percentages, late punch-in ratios, and overtime utilization
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-xs font-semibold">
            Total Overtime Logged: {totalOvertime} Hours
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Present %</th>
                <th className="py-3 px-4">Late Arrivals %</th>
                <th className="py-3 px-4">Unplanned Absence %</th>
                <th className="py-3 px-4">Overtime Hours</th>
                <th className="py-3 px-4">Punctuality Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {rows.map((row) => (
                <tr key={row.department} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {row.department}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                    {row.present}%
                  </td>
                  <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400">
                    {row.late}%
                  </td>
                  <td className="py-3.5 px-4 text-rose-500">
                    {row.absent}%
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {row.overtimeHours} hrs
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      Optimal (≥90%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
