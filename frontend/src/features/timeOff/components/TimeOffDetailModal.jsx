import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

const statusBadgeClasses = {
  PENDING:
    'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100/90 dark:border-amber-800/60',
  APPROVED:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100/90 dark:border-emerald-800/60',
  REJECTED:
    'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100/90 dark:border-rose-800/60',
  CANCELLED:
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function TimeOffDetailModal({
  isOpen,
  request,
  isHR = false,
  onClose,
  onApprove,
  onReject,
}) {
  const navigate = useNavigate();

  if (!isOpen || !request) return null;

  const statusClass = statusBadgeClasses[request.status?.toUpperCase()] || statusBadgeClasses.PENDING;
  
  // Format status for display: capitalize first letter
  const displayStatus = request.status 
    ? request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase() 
    : 'Pending';

  const daysParsed = parseFloat(request.days || "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
              {getInitials(request.employee_name)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {request.employee_name}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {request.employee_code}
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

        {/* Status & ID */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">Request:</span>
            <span className="font-mono text-slate-500">{request.id}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusClass}`}>
            {displayStatus}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">
              Leave Type
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block truncate" title={request.leave_type_name}>
              {request.leave_type_name}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">
              Days
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
              {daysParsed} day{daysParsed !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">
              Applied On
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block">
              {formatDate(request.created_at)}
            </span>
          </div>
        </div>

        {/* Date Details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Period:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatDate(request.start_date)} to {formatDate(request.end_date)}
            </span>
          </div>

          {request.reason && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <span className="font-bold block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Reason:</span>
              <p className="text-xs leading-relaxed">{request.reason}</p>
            </div>
          )}

          {request.review_comment && (
            <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
              <span className="font-bold block text-[11px] text-rose-600 dark:text-rose-400 mb-0.5">Rejection Reason:</span>
              <p className="text-xs leading-relaxed">{request.review_comment}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              navigate(`/employees/${request.employee_id}`);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            {isHR && request.status?.toUpperCase() === 'PENDING' && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onReject(request);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-bold cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onApprove(request);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Approve
                </button>
              </>
            )}
            {(!isHR || request.status?.toUpperCase() !== 'PENDING') && (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
