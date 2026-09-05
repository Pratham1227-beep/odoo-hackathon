import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, MapPin, User, Check, Sparkles } from 'lucide-react';
import { mockEmployees } from '../data/attendanceData';

export default function MarkAttendanceModal({
  isOpen,
  onClose,
  onSave,
  recordToEdit = null,
  selectedDate = '2026-09-12',
}) {
  const [formData, setFormData] = useState({
    employeeId: 'EMP001',
    employeeName: 'Ayesha Siddiqui',
    department: 'Engineering',
    date: selectedDate,
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    workHours: '8h 00m',
    status: 'Present',
    workLocation: 'Bengaluru Office',
    attendanceType: 'Regular',
    notes: '',
  });

  useEffect(() => {
    if (recordToEdit) {
      setFormData({
        id: recordToEdit.id,
        employeeId: recordToEdit.employeeId,
        employeeName: recordToEdit.employeeName,
        department: recordToEdit.department,
        date: recordToEdit.date || selectedDate,
        checkIn: recordToEdit.checkIn === '-' ? '09:00 AM' : recordToEdit.checkIn,
        checkOut: recordToEdit.checkOut === '-' ? '06:00 PM' : recordToEdit.checkOut,
        workHours: recordToEdit.workHours === '-' ? '8h 00m' : recordToEdit.workHours,
        status: recordToEdit.status,
        workLocation: recordToEdit.workLocation || 'Bengaluru Office',
        attendanceType: recordToEdit.attendanceType || 'Regular',
        notes: recordToEdit.notes || '',
      });
    } else {
      setFormData({
        employeeId: 'EMP001',
        employeeName: 'Ayesha Siddiqui',
        department: 'Engineering',
        date: selectedDate,
        checkIn: '09:00 AM',
        checkOut: '06:00 PM',
        workHours: '8h 00m',
        status: 'Present',
        workLocation: 'Bengaluru Office',
        attendanceType: 'Regular',
        notes: '',
      });
    }
  }, [recordToEdit, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleEmployeeChange = (empId) => {
    const matched = mockEmployees.find((e) => e.id === empId);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        employeeId: matched.id,
        employeeName: matched.name,
        department: matched.department,
        workLocation: matched.workLocation,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {recordToEdit ? 'Edit Attendance' : 'Mark Attendance'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record check-in, check-out, and attendance status for employees.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Employee Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Employee</span>
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              disabled={!!recordToEdit}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {mockEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id}) — {emp.department}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Attendance Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
                <option value="Late">Late</option>
              </select>
            </div>
          </div>

          {/* Check In & Check Out (if Present or Late) */}
          {(formData.status === 'Present' || formData.status === 'Late') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Check In Time</span>
                </label>
                <input
                  type="text"
                  placeholder="09:00 AM"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Check Out Time</span>
                </label>
                <input
                  type="text"
                  placeholder="06:00 PM"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}

          {/* Location & Attendance Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Work Location</span>
              </label>
              <select
                value={formData.workLocation}
                onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Bengaluru Office">Bengaluru Office</option>
                <option value="Mumbai HQ">Mumbai HQ</option>
                <option value="Delhi Office">Delhi Office</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Attendance Type
              </label>
              <select
                value={formData.attendanceType}
                onChange={(e) => setFormData({ ...formData, attendanceType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Regular">Regular</option>
                <option value="Shift A">Shift A</option>
                <option value="Approved Leave">Approved Leave</option>
                <option value="Unscheduled">Unscheduled</option>
                <option value="Overtime">Overtime</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Notes / Remarks
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Approved shift swap, travel delay, doctor appointment..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {recordToEdit ? 'Save Changes' : 'Record Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
