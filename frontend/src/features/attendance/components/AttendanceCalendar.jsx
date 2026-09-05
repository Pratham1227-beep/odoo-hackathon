import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarDayIndicators } from '../data/attendanceData';

const dotColorClasses = {
  green: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  purple: 'bg-indigo-500',
};

export default function AttendanceCalendar({
  selectedDate = '2026-09-12',
  onSelectDate,
}) {
  // Current viewing month/year state
  const [viewDate, setViewDate] = useState(() => new Date(2026, 8, 1)); // September 2026

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'short' });
  const monthLabel = `${monthName} ${year}`;

  // Get total days in current month and first day offset
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, 2 = Tue...
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 30 for Sep

  // Parse active selected date
  const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
  const isCurrentViewingSelectedMonth =
    selYear === year && selMonth - 1 === month;

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (dayNum) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const newDateStr = `${year}-${formattedMonth}-${formattedDay}`;
    onSelectDate(newDateStr);
  };

  // Build grid cells
  const gridCells = [];
  // Empty offset cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    gridCells.push(null);
  }
  // Actual day cells
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push(d);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Attendance Calendar
        </h3>

        {/* Month Navigation */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-1">{monthLabel}</span>
          <button
            onClick={handleNextMonth}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 pb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
        {gridCells.map((dayNum, index) => {
          if (!dayNum) {
            return <div key={`empty-${index}`} className="h-9" />;
          }

          const isSelected =
            isCurrentViewingSelectedMonth && selDay === dayNum;
          const dots = calendarDayIndicators[dayNum] || [];

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => handleDayClick(dayNum)}
              className="flex flex-col items-center justify-center cursor-pointer group py-0.5"
            >
              {/* Day Circle / Button */}
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                }`}
              >
                {dayNum}
              </div>

              {/* Indicator Dots */}
              <div className="flex items-center justify-center gap-0.5 h-1.5 mt-0.5">
                {!isSelected &&
                  dots.map((color, dotIdx) => (
                    <span
                      key={dotIdx}
                      className={`w-1 h-1 rounded-full ${
                        dotColorClasses[color] || 'bg-emerald-500'
                      }`}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
