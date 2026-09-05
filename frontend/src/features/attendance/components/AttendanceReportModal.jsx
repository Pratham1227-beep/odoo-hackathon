import React from 'react';
import { X, BarChart3, TrendingUp, Clock, Users, Award, Download } from 'lucide-react';

export default function AttendanceReportModal({
  isOpen,
  onClose,
  records = [],
  selectedDate = '2026-09-12',
}) {
  if (!isOpen) return null;

  const total = records.length || 18;
  const present = records.filter((r) => r.status === 'Present').length;
  const absent = records.filter((r) => r.status === 'Absent').length;
  const late = records.filter((r) => r.status === 'Late').length;
  const onLeave = records.filter((r) => r.status === 'On Leave').length;

  const attendanceRate = (( (present + late) / total ) * 100).toFixed(1);
  const onTimeRate = (((present) / (present + late || 1)) * 100).toFixed(1);

  const departmentBreakdown = [
    { dept: 'Engineering', present: 4, total: 5, rate: '90%' },
    { dept: 'Marketing', present: 2, total: 2, rate: '100%' },
    { dept: 'Design', present: 1, total: 2, rate: '50%' },
    { dept: 'HR', present: 2, total: 2, rate: '100%' },
    { dept: 'Finance', present: 0, total: 2, rate: '0%' },
    { dept: 'Support', present: 2, total: 2, rate: '100%' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Attendance Report Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Metrics for {selectedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              Attendance Rate
            </span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {attendanceRate}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              On-Time Arrival
            </span>
            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {onTimeRate}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              Avg Work Hours
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              7h 56m
            </span>
          </div>
        </div>

        {/* Department Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Department Breakdown
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Department</th>
                  <th className="p-2.5">Present / Total</th>
                  <th className="p-2.5 text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {departmentBreakdown.map((row) => (
                  <tr key={row.dept} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-medium text-slate-900 dark:text-white">
                      {row.dept}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">
                      {row.present} / {row.total}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                      {row.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
