import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { renderLeaveTypeIcon } from './LeaveRequestTable';
import { mockEmployees } from '../data/leaveRequestData';

const statusBadgeClasses = {
  Pending:
    'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100/90 dark:border-amber-800/60',
  Approved:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100/90 dark:border-emerald-800/60',
  Rejected:
    'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100/90 dark:border-rose-800/60',
  Cancelled:
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

export default function RequestDetails({
  request,
  onApprove,
  onReject,
}) {
  const navigate = useNavigate();

  if (!request) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs text-center py-12 text-slate-400">
        Select a request to view details
      </div>
    );
  }

  const empMeta = mockEmployees.find((e) => e.id === request.employeeId);
  const statusClass = statusBadgeClasses[request.status] || statusBadgeClasses.Pending;
  const isPending = request.status === 'Pending';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Request Details
        </h3>
        <button
          className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Request details options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Employee Section */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        {empMeta?.avatar ? (
          <img
            src={empMeta.avatar}
            alt={request.employeeName}
            className="w-12 h-12 rounded-full object-cover shadow-2xs cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(`/employees/${request.employeeId}`)}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
            onClick={() => navigate(`/employees/${request.employeeId}`)}
          >
            {empMeta?.initials || 'EM'}
          </div>
        )}
        <div className="flex flex-col">
          <span
            onClick={() => navigate(`/employees/${request.employeeId}`)}
            className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {request.employeeName}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {request.employeeId} • {request.department}
          </span>
        </div>
      </div>

      {/* Detail Fields List */}
      <div className="space-y-3.5 text-xs">
        {/* Leave Type */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Leave Type</span>
          <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
            {renderLeaveTypeIcon(request.leaveType)}
            <span>{request.leaveType}</span>
          </div>
        </div>

        {/* From */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">From</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{request.startDate}</span>
        </div>

        {/* To */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">To</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{request.endDate}</span>
        </div>

        {/* Total Days */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Total Days</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{request.days} days</span>
        </div>

        {/* Reason */}
        <div className="flex items-start justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400 shrink-0">Reason</span>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-right leading-relaxed">
            {request.detailedReason || request.reason}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Status</span>
          <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold border ${statusClass}`}>
            {request.status}
          </span>
        </div>

        {/* Applied On */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Applied On</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{request.appliedOn}</span>
        </div>
      </div>

      {/* Approval Controls for Pending */}
      {isPending && (
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => onReject(request)}
            className="flex-1 py-2.5 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all cursor-pointer text-center"
          >
            Reject
          </button>
          <button
            onClick={() => onApprove(request)}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer text-center"
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
}
