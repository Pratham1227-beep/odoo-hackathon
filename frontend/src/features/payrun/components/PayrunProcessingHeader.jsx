import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ArrowRight, Check, AlertCircle } from 'lucide-react';

export default function PayrunProcessingHeader({
  selectedPeriod = 'September 2026 (Monthly)',
  periods = [],
  onSelectPeriod,
  onProceed,
  canProceed = false,
  errorsCount = 0,
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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Payrun Processing / Validation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review, validate, and confirm payroll details before final processing.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 self-start sm:self-auto">
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
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Payroll Cycle
              </div>
              {periods.map((p) => {
                const label = `${p.label} (Monthly)`;
                return (
                  <button
                    key={p.id || p.label}
                    onClick={() => {
                      onSelectPeriod(label);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                      selectedPeriod.includes(p.label)
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{label}</span>
                    {selectedPeriod.includes(p.label) && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Proceed to Process Primary Button */}
        <button
          type="button"
          onClick={onProceed}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer shadow-sm ${
            canProceed
              ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-600/30'
              : 'bg-indigo-600/90 hover:bg-indigo-700 text-white shadow-indigo-600/20'
          }`}
          title={
            !canProceed
              ? `${errorsCount} blocking error(s) must be resolved before proceeding`
              : 'Proceed to review & processing'
          }
        >
          <span>Proceed to Process</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
