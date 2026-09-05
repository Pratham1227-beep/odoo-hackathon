import React from 'react';
import { ChevronRight, Plus, Copy, Calendar, Layers } from 'lucide-react';

export default function WorkingScheduleHeader({
  onOpenCreateModal,
  onOpenTemplateModal,
}) {
  return (
    <div className="mb-6 space-y-3">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Workforce</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-semibold">
          Working Schedules
        </span>
      </nav>

      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Working Schedules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and manage shifts, work hours, and rotation schedules for your organization.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Shift Templates Outlined Button */}
          <button
            type="button"
            onClick={onOpenTemplateModal}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Shift Templates</span>
          </button>

          {/* Create Schedule Primary Purple Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}
