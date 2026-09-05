import React from 'react';

export default function NotificationTabs({
  activeTab = 'all',
  onChangeTab,
  counts = { all: 12, unread: 12, important: 3, mentions: 2 },
}) {
  const tabs = [
    { id: 'all', label: `All (${counts.all ?? 0})` },
    { id: 'unread', label: `Unread (${counts.unread ?? 0})` },
    { id: 'important', label: `Important (${counts.important ?? 0})` },
    { id: 'mentions', label: `Mentions (${counts.mentions ?? 0})` },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`relative pb-3 text-sm font-semibold transition-colors duration-150 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
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
  );
}
