import React, { useState } from 'react';
import { X, Search, Activity, Calendar, Filter } from 'lucide-react';
import ActivityItem from './ActivityItem';

export default function AllActivityModal({
  isOpen,
  onClose,
  activities = [],
}) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  if (!isOpen) return null;

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase()) ||
      (act.actor && act.actor.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'all' || act.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                System Activity Log
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit trail of operations and events across WageWise
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="py-3 flex flex-col sm:flex-row items-center gap-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search audit activity by title, actor, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Modules</option>
              <option value="payroll">Payroll</option>
              <option value="leave">Leave</option>
              <option value="employee">Employee</option>
              <option value="schedule">Schedule</option>
              <option value="contract">Contract</option>
              <option value="attendance">Attendance</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto py-4 pl-1 pr-2">
          {filtered.length > 0 ? (
            filtered.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={index === filtered.length - 1}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No matching activities found
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filtered.length} total events</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
