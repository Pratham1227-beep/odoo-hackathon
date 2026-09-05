import React from 'react';

export default function ScheduleTabs({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'schedule', label: 'Schedule View' },
    { id: 'shifts', label: 'Shift Management' },
    { id: 'rotational', label: 'Rotational Schedules' },
    { id: 'holidays', label: 'Holiday Calendar' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
      <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`pb-3.5 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
