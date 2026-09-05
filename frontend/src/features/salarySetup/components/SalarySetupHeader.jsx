import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Save, Check, ChevronRight, ChevronLeft, Search, Building2 } from 'lucide-react';

export default function SalarySetupHeader({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onSave,
  isSaving,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Breadcrumbs + Title + Subtitle */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
            Payroll
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-slate-200 font-semibold">
            Salary Setup
          </span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Salary Setup
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure salary structure, components, and payment details for your employees.
        </p>
      </div>

      {/* Right: Employee Selector + Save Changes */}
      <div className="flex items-center gap-3">
        {/* Employee Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="max-w-[140px] truncate">
              {selectedEmployee ? selectedEmployee.name : 'Select Employee'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
              {/* Search within dropdown */}
              <div className="relative mb-2 px-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployee?.id === emp.id;
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        onSelectEmployee(emp);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${emp.avatarBg}`}
                        >
                          {emp.initials}
                        </div>
                        <div>
                          <div className="font-semibold">{emp.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {emp.id} • {emp.department}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No employee found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Save Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-sm shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
