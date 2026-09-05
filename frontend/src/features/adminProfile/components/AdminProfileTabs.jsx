import React from 'react';
import { User, Shield, KeyRound, History, LayoutDashboard } from 'lucide-react';

export default function AdminProfileTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Personal', label: 'Personal Details', icon: User },
    { id: 'Role', label: 'Governance & Scope', icon: Shield },
    { id: 'Security', label: 'Security & Access', icon: KeyRound },
    { id: 'Audit', label: 'Admin Audit Log', icon: History },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar pb-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
