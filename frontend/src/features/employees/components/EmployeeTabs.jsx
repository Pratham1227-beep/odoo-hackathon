import React from 'react';

const tabs = [
  'Overview',
  'Attendance',
  'Payroll',
  'Leave',
  'Performance',
  'Documents',
  'Activity',
];

export default function EmployeeTabs({ activeTab = 'Overview', onTabChange }) {
  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto scrollbar-none">
      <nav className="flex items-center gap-6 sm:gap-8 min-w-max" aria-label="Employee Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
