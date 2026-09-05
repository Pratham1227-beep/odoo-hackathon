import React, { useState } from 'react';
import { Clock, Plus, Users, MoreVertical, Edit2, Copy, Power } from 'lucide-react';
import { initialShiftTypes } from '../data/shiftTypesData';

export default function ShiftManagementTab() {
  const [shifts, setShifts] = useState(initialShiftTypes);
  const [isAdding, setIsAdding] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftTime, setNewShiftTime] = useState('09:00 AM - 05:00 PM');

  const dotColorMap = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
  };

  const handleToggleActive = (id) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleCreateNewShift = (e) => {
    e.preventDefault();
    if (!newShiftName.trim()) return;
    const newShift = {
      id: `SHIFT00${shifts.length + 1}`,
      name: newShiftName,
      badgeText: newShiftTime,
      startTime: newShiftTime.split('-')[0]?.trim() || '09:00 AM',
      endTime: newShiftTime.split('-')[1]?.trim() || '05:00 PM',
      type: 'custom',
      colorType: 'indigo',
      employeeCount: 0,
      active: true,
      description: 'Custom organizational shift.',
    };
    setShifts([...shifts, newShift]);
    setNewShiftName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Shift Types & Configurations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure working hours, overnight coverage, and active rosters across departments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shift Type</span>
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreateNewShift}
          className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs flex flex-wrap items-center gap-3"
        >
          <input
            type="text"
            placeholder="Shift Name (e.g. Twilight Shift)"
            value={newShiftName}
            onChange={(e) => setNewShiftName(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            required
          />
          <input
            type="text"
            placeholder="Timing (e.g. 02:00 PM - 10:00 PM)"
            value={newShiftTime}
            onChange={(e) => setNewShiftTime(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            required
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
            >
              Save Shift
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      dotColorMap[shift.colorType] || 'bg-slate-400'
                    }`}
                  />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {shift.name}
                  </h3>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    shift.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {shift.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                {shift.badgeText}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {shift.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {shift.employeeCount} Assigned Employees
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(shift.id)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
                >
                  {shift.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
