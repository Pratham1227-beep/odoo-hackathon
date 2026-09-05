import React from 'react';
import ScheduleCell from './ScheduleCell';

export default function ScheduleTable({
  employees,
  weekDays,
  onCellClick,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[780px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {/* Employee Column Header */}
              <th className="py-3.5 pl-5 pr-4 w-[220px] font-bold text-slate-900 dark:text-white">
                Employee
              </th>

              {/* 7 Days Headers */}
              {weekDays.map((day) => (
                <th
                  key={day.key}
                  className="py-3 px-2 text-center font-normal min-w-[100px]"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {day.day}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {day.date}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No employees match your filters
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try selecting different department, location, or shift filters.
                  </p>
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Employee Identity Cell */}
                  <td className="py-3 pl-5 pr-4">
                    <div className="flex items-center gap-3">
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200/80 dark:ring-slate-700"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            emp.avatarBg || 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {emp.initials || emp.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {emp.role}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Days of the Week Cells */}
                  {weekDays.map((day) => {
                    const dayData = emp.days?.[day.key];
                    return (
                      <td key={day.key} className="py-2.5 px-1.5 text-center">
                        <ScheduleCell
                          dayData={dayData}
                          employee={emp}
                          dayKey={day.key}
                          dayHeader={day}
                          onClick={onCellClick}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Morning Shift (9 AM – 5 PM)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <span>Day Shift (10 AM – 6 PM)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span>Night Shift (6 PM – 2 AM)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>Flexible Shift</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span>Remote Work</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <span>Off / Holiday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
