import React from 'react';
import { Clock, Timer, AlertTriangle } from 'lucide-react';

export default function AttendanceSettingsTab({ settings, onChange }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Attendance & Working Shift Policies</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Standard business hours, late arrival grace windows, overtime compensation factor, and biometric sync
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Standard Daily Work Hours
          </label>
          <input
            type="number"
            value={settings.standardWorkHoursPerDay}
            onChange={(e) => onChange('standardWorkHoursPerDay', Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Standard Work Days Per Week
          </label>
          <select
            value={settings.standardWorkDaysPerWeek}
            onChange={(e) => onChange('standardWorkDaysPerWeek', Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value={5}>5 Days (Monday - Friday)</option>
            <option value={6}>6 Days (Monday - Saturday)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Late Punch-in Grace Period (Minutes)
          </label>
          <input
            type="number"
            value={settings.gracePeriodMinutes}
            onChange={(e) => onChange('gracePeriodMinutes', Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="text-2xs text-slate-400 mt-1">Arrival within grace window will not mark employee as late.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Half-Day Minimum Presence (Hours)
          </label>
          <input
            type="number"
            value={settings.halfDayMinimumHours}
            onChange={(e) => onChange('halfDayMinimumHours', Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Overtime Pay Multiplier
          </label>
          <input
            type="number"
            step="0.1"
            value={settings.overtimeMultiplier}
            onChange={(e) => onChange('overtimeMultiplier', Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="text-2xs text-slate-400 mt-1">Hourly rate multiplier for authorized extra hours (1.5x standard).</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Daily Auto-Checkout Cutoff Time
          </label>
          <input
            type="time"
            value={settings.autoCheckoutTime}
            onChange={(e) => onChange('autoCheckoutTime', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>
    </div>
  );
}
