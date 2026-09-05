import React, { useState } from 'react';
import { Check, Settings, Save, CheckCircle2 } from 'lucide-react';
import { initialScheduleSettings } from '../data/workingScheduleData';
import { initialShiftTypes } from '../data/shiftTypesData';

export default function ScheduleSettingsTab() {
  const [settings, setSettings] = useState(initialScheduleSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleDayToggle = (day) => {
    setSettings((prev) => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day],
      },
    }));
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Working Schedule Rules & Defaults
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Define organizational working days, default shifts, and attendance policy parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Working Week Days */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Standard Organizational Working Week
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Select days treated as regular working days. Unselected days automatically default to 'Off'.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
            {Object.keys(settings.workingDays).map((day) => {
              const active = settings.workingDays[day];
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`py-3 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <div className="text-xs">{day.slice(0, 3)}</div>
                  <div className="text-[10px] font-normal mt-0.5">
                    {active ? 'Work' : 'Off'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Defaults & Locations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Defaults & Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Shift for New Employees
              </label>
              <select
                value={settings.defaultShift}
                onChange={(e) =>
                  setSettings({ ...settings, defaultShift: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {initialShiftTypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.badgeText})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Primary Location
              </label>
              <select
                value={settings.defaultLocation}
                onChange={(e) =>
                  setSettings({ ...settings, defaultLocation: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Head Office">Head Office</option>
                <option value="Remote">Remote</option>
                <option value="Branch Office">Branch Office</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2 space-y-3">
            {/* Flexible Hours Toggle */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Allow Flexible Hours Scheduling
                </div>
                <div className="text-[11px] text-slate-400">
                  Allow eligible employees to adjust daily start/end times within core window.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowFlexibleHours')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.allowFlexibleHours
                    ? 'bg-indigo-600 justify-end'
                    : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* Remote Work Toggle */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Allow Remote Work Tagging
                </div>
                <div className="text-[11px] text-slate-400">
                  Enable location switching on specific days without changing base shift timings.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowRemoteWork')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.allowRemoteWork
                    ? 'bg-indigo-600 justify-end'
                    : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* Auto Assign Holidays Toggle */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Auto-Assign Organization Holidays
                </div>
                <div className="text-[11px] text-slate-400">
                  Automatically mark gazetted holidays as 'Off / Holiday' on employee schedules.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('autoAssignHolidays')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.autoAssignHolidays
                    ? 'bg-indigo-600 justify-end'
                    : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Schedule Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
