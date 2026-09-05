import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { mockEmployees } from '../data/leaveRequestData';

export default function ApprovalModal({
  isOpen,
  request,
  onClose,
  onConfirmApprove,
}) {
  if (!isOpen || !request) return null;

  const empMeta = mockEmployees.find((e) => e.id === request.employeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-5">
        
        {/* Header with Emerald Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Approve Leave Request?
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {request.id} • {request.department}
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

        {/* Request Details Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">{request.employeeName}</span> has requested{' '}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{request.leaveType}</span> from{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{request.startDate}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{request.endDate}</span>.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Duration:
            </span>
            <span className="font-bold text-slate-900 dark:text-white px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800">
              {request.days} day{request.days > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={() => {
              onConfirmApprove(request);
              onClose();
            }}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Approve Request
          </button>
        </div>

      </div>
    </div>
  );
}
