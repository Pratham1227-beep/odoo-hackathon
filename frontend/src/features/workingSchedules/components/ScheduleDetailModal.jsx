import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, User, CheckCircle2 } from 'lucide-react';
import { initialShiftTypes } from '../data/shiftTypesData';

export default function ScheduleDetailModal({
  isOpen,
  onClose,
  cellContext,
  onSaveCell,
}) {
  const [shiftId, setShiftId] = useState('SHIFT001');
  const [status, setStatus] = useState('shift'); // 'shift', 'remote', 'off', 'holiday'
  const [location, setLocation] = useState('Office');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');

  useEffect(() => {
    if (cellContext) {
      const { dayData } = cellContext;
      if (dayData) {
        setStatus(dayData.type || 'shift');
        setShiftId(dayData.shiftId || 'SHIFT001');
        setLocation(dayData.location || 'Office');

        if (dayData.time && dayData.time.includes('-')) {
          const parts = dayData.time.split('-');
          setStartTime(parts[0]?.trim() || '09:00 AM');
          setEndTime(parts[1]?.trim() || '05:00 PM');
        }
      }
    }
  }, [cellContext]);

  if (!isOpen || !cellContext) return null;

  const { employee, dayKey, dayData, dayHeader } = cellContext;

  const handleSave = (e) => {
    e.preventDefault();

    let updatedDayData = { ...dayData, location };

    if (status === 'remote') {
      updatedDayData = {
        type: 'remote',
        label: 'Remote',
        time: `${startTime} - ${endTime}`,
        location: 'Remote Work',
      };
    } else if (status === 'off') {
      updatedDayData = {
        type: 'off',
        label: 'Off',
        time: 'Rest Day',
        location: 'None',
      };
    } else if (status === 'holiday') {
      updatedDayData = {
        type: 'holiday',
        label: 'Holiday',
        time: 'Public Holiday',
        location: 'None',
      };
    } else {
      const selectedShift = initialShiftTypes.find((s) => s.id === shiftId);
      const timeStr = `${startTime} - ${endTime}`;
      updatedDayData = {
        type: 'shift',
        shiftId,
        label: `${startTime}\n- ${endTime}`,
        time: timeStr,
        location,
      };
    }

    onSaveCell(employee.id, dayKey, updatedDayData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Shift Details & Override
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Employee & Date info card */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {employee.avatar ? (
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    employee.avatarBg || 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {employee.initials || 'EM'}
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {employee.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {employee.role} • {employee.department}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {dayHeader?.day}
              </span>
              <div className="text-[11px] text-slate-400 font-medium">
                {dayHeader?.date}
              </div>
            </div>
          </div>

          {/* Status Mode */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Day Status
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'shift', label: 'Working' },
                { id: 'remote', label: 'Remote' },
                { id: 'off', label: 'Off Day' },
                { id: 'holiday', label: 'Holiday' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id)}
                  className={`py-2 px-1 rounded-xl border text-center font-semibold text-[11px] transition-colors cursor-pointer ${
                    status === st.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* If Working Shift: Select Shift & Timings */}
          {status === 'shift' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Shift
                </label>
                <select
                  value={shiftId}
                  onChange={(e) => {
                    setShiftId(e.target.value);
                    const sel = initialShiftTypes.find((s) => s.id === e.target.value);
                    if (sel) {
                      setStartTime(sel.startTime);
                      setEndTime(sel.endTime);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {initialShiftTypes.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.badgeText})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </>
          )}

          {/* Location */}
          {status !== 'off' && status !== 'holiday' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Office">Office / Head Office</option>
                <option value="Remote">Remote</option>
                <option value="Branch Office">Branch Office</option>
                <option value="Client Site">Client Site</option>
              </select>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
