import React, { useState } from 'react';
import { X, RotateCw, Plus } from 'lucide-react';
import { initialShiftTypes } from '../data/shiftTypesData';

export default function RotationalScheduleModal({
  isOpen,
  onClose,
  onCreateRotation,
}) {
  const [rotationName, setRotationName] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [cycleWeeks, setCycleWeeks] = useState(4);
  const [employeesCount, setEmployeesCount] = useState(12);
  const [startDate, setStartDate] = useState('2026-10-01');
  const [week1, setWeek1] = useState('Morning Shift');
  const [week2, setWeek2] = useState('Day Shift');
  const [week3, setWeek3] = useState('Night Shift');
  const [week4, setWeek4] = useState('Morning Shift');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rotationName.trim()) return;

    onCreateRotation({
      id: `ROT00${Date.now().toString().slice(-3)}`,
      name: rotationName,
      department,
      cycleWeeks: Number(cycleWeeks),
      employeesCount: Number(employeesCount),
      startDate,
      currentShift: week1,
      nextShift: week2,
      status: 'Active',
      weeks: [
        { week: 1, shiftName: week1 },
        { week: 2, shiftName: week2 },
        { week: 3, shiftName: week3 },
        { week: 4, shiftName: week4 },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Create Rotational Schedule
              </h2>
              <p className="text-xs text-slate-400">
                Setup rotating shift cycles across multi-week periods.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rotation Name *
            </label>
            <input
              type="text"
              required
              value={rotationName}
              onChange={(e) => setRotationName(e.target.value)}
              placeholder="e.g. Operations Team 4-Week Rotation"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Operations">Operations</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Engineering">Engineering</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Headcount
              </label>
              <input
                type="number"
                min="1"
                value={employeesCount}
                onChange={(e) => setEmployeesCount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Weeks Shift Map */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Weekly Shift Progression
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Week 1 Shift</span>
                <select
                  value={week1}
                  onChange={(e) => setWeek1(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Morning Shift">Morning Shift (9 AM - 5 PM)</option>
                  <option value="Day Shift">Day Shift (10 AM - 6 PM)</option>
                  <option value="Night Shift">Night Shift (6 PM - 2 AM)</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium">Week 2 Shift</span>
                <select
                  value={week2}
                  onChange={(e) => setWeek2(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Day Shift">Day Shift (10 AM - 6 PM)</option>
                  <option value="Morning Shift">Morning Shift (9 AM - 5 PM)</option>
                  <option value="Night Shift">Night Shift (6 PM - 2 AM)</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium">Week 3 Shift</span>
                <select
                  value={week3}
                  onChange={(e) => setWeek3(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Night Shift">Night Shift (6 PM - 2 AM)</option>
                  <option value="Morning Shift">Morning Shift (9 AM - 5 PM)</option>
                  <option value="Day Shift">Day Shift (10 AM - 6 PM)</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium">Week 4 Shift</span>
                <select
                  value={week4}
                  onChange={(e) => setWeek4(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Morning Shift">Morning Shift (9 AM - 5 PM)</option>
                  <option value="Day Shift">Day Shift (10 AM - 6 PM)</option>
                  <option value="Night Shift">Night Shift (6 PM - 2 AM)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
            >
              Create Rotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
