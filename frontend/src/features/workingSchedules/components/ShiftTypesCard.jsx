import React from 'react';
import { initialShiftTypes } from '../data/shiftTypesData';

export default function ShiftTypesCard({ onManageShifts }) {
  const dotColorMap = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Shift Types
        </h3>
        <button
          type="button"
          onClick={onManageShifts}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          Manage
        </button>
      </div>

      <div className="space-y-3">
        {initialShiftTypes.map((shift) => (
          <div
            key={shift.id}
            className="flex items-center justify-between text-xs py-0.5"
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                  dotColorMap[shift.colorType] || 'bg-slate-400'
                }`}
              />
              <div>
                <div className="font-bold text-slate-900 dark:text-white leading-tight">
                  {shift.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {shift.badgeText}
                </div>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              {shift.employeeCount} employees
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
