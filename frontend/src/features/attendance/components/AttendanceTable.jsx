import React from 'react';
import { useNavigate } from 'react-router-dom';
import AttendanceRowActions from './AttendanceRowActions';
import { mockEmployees } from '../data/attendanceData';

const avatarThemeClasses = {
  purple: 'bg-indigo-100/90 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300',
  blue: 'bg-sky-100/90 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300',
  pink: 'bg-pink-100/90 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300',
  teal: 'bg-teal-100/90 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300',
  violet: 'bg-purple-100/90 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
  sky: 'bg-blue-100/90 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
  rose: 'bg-rose-100/90 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
  mint: 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
};

const statusBadgeClasses = {
  Present:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100/90 dark:border-emerald-800/60',
  Absent:
    'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100/90 dark:border-rose-800/60',
  'On Leave':
    'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100/90 dark:border-amber-800/60',
  Late:
    'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-100/90 dark:border-purple-800/60',
};

export default function AttendanceTable({
  records = [],
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onViewDetails,
  onEditAttendance,
  onQuickCheckIn,
  onQuickCheckOut,
  onAddNote,
}) {
  const navigate = useNavigate();
  const allSelected = records.length > 0 && selectedIds.length === records.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < records.length;

  if (records.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No attendance records found
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Try adjusting your filter or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-left border-collapse min-w-[760px]">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {/* Checkbox */}
            <th className="py-3.5 pl-2 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                aria-label="Select all rows"
              />
            </th>
            <th className="py-3.5 font-semibold">Employee</th>
            <th className="py-3.5 font-semibold">Department</th>
            <th className="py-3.5 font-semibold">Check In</th>
            <th className="py-3.5 font-semibold">Check Out</th>
            <th className="py-3.5 font-semibold">Work Hours</th>
            <th className="py-3.5 font-semibold">Status</th>
            <th className="py-3.5 pr-2 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
          {records.map((rec) => {
            const isSelected = selectedIds.includes(rec.id);
            const statusClass =
              statusBadgeClasses[rec.status] || statusBadgeClasses.Present;
            
            // Match employee metadata (avatar image / initials)
            const empMeta = mockEmployees.find((e) => e.id === rec.employeeId);
            const avatarTheme = empMeta?.avatarTheme || 'purple';
            const initials =
              empMeta?.initials ||
              rec.employeeName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2);
            const avatarImg = empMeta?.avatar;

            return (
              <tr
                key={rec.id}
                className={`transition-colors group ${
                  isSelected
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Row Checkbox */}
                <td className="py-3 pl-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(rec.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    aria-label={`Select ${rec.employeeName}`}
                  />
                </td>

                {/* Employee: Photo / Initials + Name + EMP ID */}
                <td className="py-3 pr-4 whitespace-nowrap">
                  <div
                    onClick={() => navigate(`/employees/${rec.employeeId}`)}
                    className="flex items-center gap-3 cursor-pointer group-hover:opacity-90"
                  >
                    {avatarImg ? (
                      <img
                        src={avatarImg}
                        alt={rec.employeeName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full ${
                          avatarThemeClasses[avatarTheme] || avatarThemeClasses.purple
                        } flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {rec.employeeName}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                        {rec.employeeId}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Department */}
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                  {rec.department}
                </td>

                {/* Check In */}
                <td className="py-3 pr-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {rec.checkIn || '-'}
                </td>

                {/* Check Out */}
                <td className="py-3 pr-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {rec.checkOut || '-'}
                </td>

                {/* Work Hours */}
                <td className="py-3 pr-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {rec.workHours || '-'}
                </td>

                {/* Status Badge */}
                <td className="py-3 pr-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${statusClass}`}
                  >
                    {rec.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 pr-2 text-right whitespace-nowrap">
                  <AttendanceRowActions
                    record={rec}
                    onViewDetails={onViewDetails}
                    onEditAttendance={onEditAttendance}
                    onQuickCheckIn={onQuickCheckIn}
                    onQuickCheckOut={onQuickCheckOut}
                    onAddNote={onAddNote}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
