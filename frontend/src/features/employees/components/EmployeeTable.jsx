import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeRowActions from './EmployeeRowActions';

const avatarColorStyles = {
  purple: 'bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300',
  blue: 'bg-sky-100/80 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300',
  pink: 'bg-pink-100/80 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300',
  teal: 'bg-teal-100/80 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300',
  violet: 'bg-purple-100/80 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
  sky: 'bg-blue-100/80 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
  rose: 'bg-rose-100/80 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
  mint: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
};

const statusBadgeStyles = {
  Active:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60',
  'On Leave':
    'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100 dark:border-amber-800/60',
  Inactive:
    'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100 dark:border-rose-800/60',
};

export default function EmployeeTable({
  employees = [],
  startIndex = 0,
  onEditEmployee,
}) {
  const navigate = useNavigate();

  if (employees.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No employees found
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Try adjusting your search or filter parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-left border-collapse min-w-[860px]">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <th className="pb-3 pl-2 w-10 font-semibold">#</th>
            <th className="pb-3 font-semibold">Employee</th>
            <th className="pb-3 font-semibold">Email</th>
            <th className="pb-3 font-semibold">Department</th>
            <th className="pb-3 font-semibold">Role</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold">Join Date</th>
            <th className="pb-3 pr-2 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
          {employees.map((emp, index) => {
            const avatarStyle =
              avatarColorStyles[emp.avatarTheme] || avatarColorStyles.purple;
            const statusStyle =
              statusBadgeStyles[emp.status] || statusBadgeStyles.Active;

            return (
              <tr
                key={emp.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Index # */}
                <td className="py-3.5 pl-2 text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                  {startIndex + index + 1}
                </td>

                {/* Employee (Avatar + Name + EMP ID) */}
                <td className="py-3.5 pr-4 whitespace-nowrap">
                  <div
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="flex items-center gap-3 cursor-pointer group-hover:opacity-90"
                  >
                    {/* Initials Avatar */}
                    <div
                      className={`w-9 h-9 rounded-xl ${avatarStyle} flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs group-hover:scale-105 transition-transform`}
                    >
                      {emp.initials}
                    </div>
                    {/* Name & ID */}
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {emp.name}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                        {emp.id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {emp.email}
                </td>

                {/* Department */}
                <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                  {emp.department}
                </td>

                {/* Role */}
                <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {emp.role}
                </td>

                {/* Status Badge */}
                <td className="py-3.5 pr-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${statusStyle}`}
                  >
                    {emp.status}
                  </span>
                </td>

                {/* Join Date */}
                <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {emp.joinDate}
                </td>

                {/* Actions */}
                <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                  <EmployeeRowActions
                    employee={emp}
                    onEdit={onEditEmployee}
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
