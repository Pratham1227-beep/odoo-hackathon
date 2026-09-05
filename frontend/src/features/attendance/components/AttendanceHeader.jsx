import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Plus, Check } from 'lucide-react';

export const quickDates = [
  { label: 'Thu, 12 Sep 2026 (Selected)', value: '2026-09-12' },
  { label: 'Wed, 11 Sep 2026', value: '2026-09-11' },
  { label: 'Tue, 10 Sep 2026', value: '2026-09-10' },
  { label: 'Mon, 09 Sep 2026', value: '2026-09-09' },
  { label: 'Fri, 06 Sep 2026', value: '2026-09-06' },
  { label: 'Thu, 05 Sep 2026', value: '2026-09-05' },
];

export default function AttendanceHeader({
  selectedDate = '2026-09-12',
  onSelectDate,
  onOpenMarkModal,
}) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Format display string e.g. "Thu, 12 Sep 2026"
  const formatDisplayDate = (isoDateStr) => {
    try {
      const [year, month, day] = isoDateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Thu, 12 Sep 2026';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Attendance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track employee attendance and manage work hours efficiently.
        </p>
      </div>

      {/* Date Selector & Primary Action */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer focus:outline-none"
            aria-label="Select attendance date"
          >
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{formatDisplayDate(selectedDate)}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Date Picker Popover */}
          {isDatePickerOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Date
              </div>
              <div className="py-1 space-y-1">
                {quickDates.map((item) => {
                  const isSelected = item.value === selectedDate;
                  return (
                    <button
                      key={item.value}
                      onClick={() => {
                        onSelectDate(item.value);
                        setIsDatePickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors text-left ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Input */}
              <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80 px-2 pb-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Custom Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      onSelectDate(e.target.value);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Primary Action: Mark Attendance Button */}
        <button
          onClick={onOpenMarkModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Mark Attendance</span>
        </button>
      </div>
    </div>
  );
}
