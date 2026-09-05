import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { mockEmployees } from '../data/attendanceData';

const statusBadgeClasses = {
  Present:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60',
  Absent:
    'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100 dark:border-rose-800/60',
  'On Leave':
    'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100 dark:border-amber-800/60',
  Late:
    'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-100 dark:border-purple-800/60',
};

export default function AttendanceDetailModal({
  isOpen,
  onClose,
  record,
  onEdit,
}) {
  const navigate = useNavigate();
  if (!isOpen || !record) return null;

  const empMeta = mockEmployees.find((e) => e.id === record.employeeId);
  const statusClass =
    statusBadgeClasses[record.status] || statusBadgeClasses.Present;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {empMeta?.avatar ? (
              <img
                src={empMeta.avatar}
                alt={record.employeeName}
                className="w-11 h-11 rounded-full object-cover shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                {empMeta?.initials || 'EM'}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {record.employeeName}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {record.employeeId} • {record.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Date */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {record.date || '2026-09-12'}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusClass}`}>
            {record.status}
          </span>
        </div>

        {/* Attendance Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">
              Check In
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 block">
              {record.checkIn || '-'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">
              Check Out
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 block">
              {record.checkOut || '-'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">
              Work Hours
            </span>
            <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
              {record.workHours || '-'}
            </span>
          </div>
        </div>

        {/* Location & Attendance Type */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Work Location:
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {record.workLocation || 'Bengaluru Office'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Attendance Type:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {record.attendanceType || 'Regular'}
            </span>
          </div>

          {record.notes && (
            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-300">
              <span className="font-bold block text-[11px] mb-0.5">Notes:</span>
              <p className="text-xs">{record.notes}</p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              navigate(`/employees/${record.employeeId}`);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View Full Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
