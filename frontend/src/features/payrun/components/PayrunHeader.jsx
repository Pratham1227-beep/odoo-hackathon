import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Play, ChevronDown, Check } from 'lucide-react';

export default function PayrunHeader({
  selectedPeriod,
  periods = [],
  onSelectPeriod,
  onOpenRunPayroll,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPeriod = periods.find((p) => p.label === selectedPeriod) || { label: selectedPeriod };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Title and Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Payrun
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Process payroll for the selected period and generate payslips.
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 self-start sm:self-auto">
        {/* Period Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-0.5" />
          </button>

          {/* Period Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Payroll Cycle
              </div>
              {periods.map((period) => (
                <button
                  key={period.id || period.label}
                  onClick={() => {
                    onSelectPeriod(period.label);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                    period.label === selectedPeriod
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{period.label}</span>
                    {period.status && (
                      <span className="text-[11px] text-slate-400 font-normal">
                        Status: {period.status}
                      </span>
                    )}
                  </div>
                  {period.label === selectedPeriod && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Run Payroll CTA Button */}
        <button
          type="button"
          onClick={onOpenRunPayroll}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/30 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <Play className="w-4 h-4 fill-white text-white" />
          <span>Run Payroll</span>
        </button>
      </div>
    </div>
  );
}
