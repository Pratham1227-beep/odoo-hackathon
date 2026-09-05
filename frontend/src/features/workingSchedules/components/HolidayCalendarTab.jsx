import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { attendanceService } from '../../attendance/services/attendanceService';

export default function HolidayCalendarTab() {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('PUBLIC');

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.listHolidays();
      if (Array.isArray(data)) {
        const mapped = data.map((h) => ({
          id: h.id,
          name: h.name,
          date: h.date,
          displayDate: new Date(h.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          dayOfWeek: new Date(h.date).toLocaleDateString('en-US', { weekday: 'long' }),
          type: h.type || 'PUBLIC',
          description: h.description || 'Organizational public holiday',
          affectsAllShifts: true,
        }));
        setHolidays(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await attendanceService.createHoliday({
        name: name.trim(),
        date: date,
        type: type,
        description: 'Organizational holiday',
      });
      setName('');
      setIsAdding(false);
      fetchHolidays();
    } catch (err) {
      alert('Error creating holiday: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleDeleteHoliday = (id) => {
    setHolidays(holidays.filter((h) => h.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Organizational Holiday Calendar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Declared non-working days automatically applied to employee rosters and attendance gates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddHoliday}
          className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs flex flex-wrap items-center gap-3"
        >
          <input
            type="text"
            placeholder="Holiday Name (e.g. New Year Day)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="Gazetted">Gazetted Holiday</option>
            <option value="National">National Holiday</option>
            <option value="Restricted">Restricted / Optional</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
            >
              Save
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

      {/* Holiday Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 pl-5">Holiday Event</th>
              <th className="py-3.5">Calendar Date</th>
              <th className="py-3.5">Day</th>
              <th className="py-3.5">Type</th>
              <th className="py-3.5">Impact</th>
              <th className="py-3.5 pr-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {holidays.map((h) => (
              <tr
                key={h.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3.5 pl-5 font-bold text-slate-900 dark:text-white">
                  {h.name}
                </td>
                <td className="py-3.5 text-slate-700 dark:text-slate-300 font-semibold">
                  {h.displayDate}
                </td>
                <td className="py-3.5 text-slate-500 dark:text-slate-400">
                  {h.dayOfWeek}
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {h.type}
                  </span>
                </td>
                <td className="py-3.5 text-slate-500 dark:text-slate-400">
                  All Offices Closed (Paid Rest)
                </td>
                <td className="py-3.5 pr-5 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteHoliday(h.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Remove Holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
