import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ScheduleCalendar({
  selectedDay = 22,
  onSelectDay,
}) {
  const [currentMonth, setCurrentMonth] = useState('September 2026');

  // Days of September 2026
  // Sep 1, 2026 is a Tuesday (starts at index 2 in S M T W T F S: Sun=0, Mon=1, Tue=2)
  const blanks = [null, null]; // Sun, Mon
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...daysInMonth];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Calendar
        </h3>
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <button
            type="button"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span>{currentMonth}</span>
          <button
            type="button"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {calendarCells.map((day, idx) => {
          if (!day) {
            return <div key={`blank-${idx}`} className="h-7" />;
          }

          const isSelected = day === selectedDay;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay && onSelectDay(day)}
              className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
