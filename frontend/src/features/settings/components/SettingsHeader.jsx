import React from 'react';
import { Save, Check } from 'lucide-react';

export default function SettingsHeader({ onSave, isSaving }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings & Configuration
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage tenant profile, statutory rules, payroll parameters, attendance policies, and security controls.
        </p>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 rounded-xl shadow-sm transition-all duration-150 cursor-pointer self-start sm:self-auto"
      >
        <Save className="w-4 h-4" />
        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
      </button>
    </div>
  );
}
