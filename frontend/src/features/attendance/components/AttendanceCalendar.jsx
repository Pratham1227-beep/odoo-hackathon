import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const statusDot = {
  Present: 'bg-emerald-500',
  Late: 'bg-amber-500',
  Absent: 'bg-rose-500',
  'Half Day': 'bg-sky-500',
  Holiday: 'bg-indigo-500',
  'On Leave': 'bg-indigo-500',
};

export default function AttendanceCalendar({
  selectedDate,
  onSelectDate,
  records = [],
}) {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = (selectedDate || '').split('-').map(Number);
    if (y && m) return new Date(y, m - 1, 1);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    const [y, m] = (selectedDate || '').split('-').map(Number);
    if (y && m) {
      setViewDate(new Date(y, m - 1, 1));
    }
  }, [selectedDate]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const [selYear, selMonth, selDay] = (selectedDate || '').split('-').map(Number);
  const isCurrentViewingSelectedMonth = selYear === year && selMonth - 1 === month;

  const dayStatusMap = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!r.date) return;
      const day = Number(String(r.date).split('-')[2]);
      if (!map[day]) map[day] = new Set();
      map[day].add(r.status);
    });
    return map;
  }, [records]);

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (dayNum) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    onSelectDate(`${year}-${formattedMonth}-${formattedDay}`);
  };

  const gridCells = [];
  for (let i = 0; i < firstDayOfWeek; i += 1) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) gridCells.push(d);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Attendance Calendar
        </h3>
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

      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 pb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
        {gridCells.map((dayNum, index) => {
          if (!dayNum) return <div key={`empty-${index}`} className="h-9" />;

          const isSelected = isCurrentViewingSelectedMonth && selDay === dayNum;
          const statuses = dayStatusMap[dayNum]
            ? Array.from(dayStatusMap[dayNum]).slice(0, 3)
            : [];

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => handleDayClick(dayNum)}
              className="flex flex-col items-center justify-center cursor-pointer group py-0.5"
            >
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                }`}
              >
                {dayNum}
              </div>
              <div className="flex items-center justify-center gap-0.5 h-1.5 mt-0.5">
                {!isSelected &&
                  statuses.map((status) => (
                    <span
                      key={status}
                      className={`w-1 h-1 rounded-full ${
                        statusDot[status] || 'bg-emerald-500'
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
