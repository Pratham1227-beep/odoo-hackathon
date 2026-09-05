import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronDown, Plus, Check, LogIn, LogOut, Loader2 } from 'lucide-react';
import { formatDateISO } from '../utils/attendanceMappers';

function buildQuickDates(selectedDate) {
  const base = new Date();
  const dates = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const value = formatDateISO(d);
    const label = d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    dates.push({
      label: value === selectedDate ? `${label} (Selected)` : label,
      value,
    });
  }
  return dates;
}

export default function AttendanceHeader({
  selectedDate,
  onSelectDate,
  onOpenMarkModal,
  isHr = false,
  isToday = true,
  onClockIn,
  onClockOut,
  clockInDisabled = false,
  clockOutDisabled = false,
  showSelfClock = true,
  roleLabel = '',
  actionLoading = false,
}) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const quickDates = useMemo(() => buildQuickDates(selectedDate), [selectedDate]);

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
      return isoDateStr;
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Attendance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isHr
            ? `Org-wide attendance for ${roleLabel.toLowerCase()} — view and manage employee records.`
            : 'Your attendance — clock in/out and review your daily records.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer focus:outline-none"
            aria-label="Select attendance date"
          >
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{formatDisplayDate(selectedDate)}</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isDatePickerOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

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
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>

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

        {showSelfClock && isToday && (
          <>
            <button
              onClick={onClockIn}
              disabled={clockInDisabled}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>Clock In</span>
            </button>
            <button
              onClick={onClockOut}
              disabled={clockOutDisabled}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>Clock Out</span>
            </button>
          </>
        )}

        {isHr && (
          <button
            onClick={onOpenMarkModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        )}
      </div>
    </div>
  );
}
