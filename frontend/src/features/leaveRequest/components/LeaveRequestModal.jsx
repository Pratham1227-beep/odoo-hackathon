import React, { useState, useEffect } from 'react';
import { X, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';

export default function LeaveRequestModal({
  isOpen,
  onClose,
  onSubmit,
  requestToEdit = null,
  leaveTypes = [],
  employees = [],
}) {
  const { user } = useAuthStore();
  const isHR = user && ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'].includes(user.role);

  const defaultStartDate = new Date().toISOString().split('T')[0];
  const defaultEndDate = defaultStartDate;

  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type_id: '',
    start_date: defaultStartDate,
    end_date: defaultEndDate,
    reason: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (requestToEdit) {
      setFormData({
        id: requestToEdit.id,
        employee_id: requestToEdit.employee_id || '',
        leave_type_id: requestToEdit.leave_type_id || (leaveTypes[0]?.id || ''),
        start_date: requestToEdit.start_date || defaultStartDate,
        end_date: requestToEdit.end_date || defaultEndDate,
        reason: requestToEdit.reason || '',
      });
    } else {
      setFormData({
        employee_id: isHR && employees.length > 0 ? employees[0].id : '',
        leave_type_id: leaveTypes.length > 0 ? leaveTypes[0].id : '',
        start_date: defaultStartDate,
        end_date: defaultEndDate,
        reason: '',
      });
    }
    setError('');
  }, [requestToEdit, isOpen, leaveTypes, employees, isHR]);

  if (!isOpen) return null;

  // Auto-calculate days
  const calculateDays = () => {
    try {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  const calculatedDays = calculateDays();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date cannot be earlier than start date.');
      return;
    }
    if (!formData.leave_type_id) {
      setError('Please select a leave type.');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Please provide a reason for the leave request.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        leave_type_id: formData.leave_type_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason.trim(),
      };

      if (isHR && formData.employee_id) {
        payload.employee_id = formData.employee_id;
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to submit leave request.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {requestToEdit ? 'Edit Leave Request' : 'New Leave Request'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Create an employee leave request for manager review and approval.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Employee Selection for HR */}
          {isHR && employees.length > 0 && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>On Behalf of Employee</span>
              </label>
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Myself / Default --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code || emp.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Leave Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Leave Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.leave_type_id}
              onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
            >
              <option value="">-- Select Leave Type --</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.code})
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>From <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>To <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Duration Summary */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200">
              Total Days:
            </span>
            <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs">
              {calculatedDays} day{calculatedDays > 1 ? 's' : ''}
            </span>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Reason <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              rows={3}
              placeholder="State the reason for this leave..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
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
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : requestToEdit ? 'Save Changes' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
