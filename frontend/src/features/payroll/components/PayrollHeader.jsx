import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, Play, SlidersHorizontal, Check, Plus } from 'lucide-react';

export default function PayrollHeader({
  selectedPeriod = 'September 2026',
  onSelectPeriod,
}) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const periods = ['September 2026', 'August 2026', 'July 2026', 'June 2026'];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Payroll Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage company compensation, payroll cycles, statutory compliance, and payslips.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
        {/* Period Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Cycle
              </div>
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onSelectPeriod(p);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition-colors ${
                    selectedPeriod === p
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span>{p}</span>
                  {selectedPeriod === p && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Salary Setup Button */}
        <Link
          to="/salary-setup"
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span>Salary Setup</span>
        </Link>

        {/* Run / Manage Payrun Primary CTA */}
        <Link
          to="/payrun"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/30 transition-all"
        >
          <Play className="w-4 h-4 fill-white text-white" />
          <span>Open Payrun</span>
        </Link>
      </div>
    </div>
  );
}
