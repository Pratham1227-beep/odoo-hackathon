import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Calendar, User } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ApproveRejectModal({
  isOpen,
  mode = 'approve', // 'approve' | 'reject' | 'cancel'
  request,
  onClose,
  onConfirm,
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const isApprove = mode === 'approve';
  const isReject = mode === 'reject';
  const isCancel = mode === 'cancel';

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm({
        request,
        mode,
        rejectionReason: isReject ? rejectionReason : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-5">
        
        {/* Header with Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xs ${
                isApprove
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : isReject
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isApprove && <CheckCircle2 className="w-6 h-6" />}
              {isReject && <XCircle className="w-6 h-6" />}
              {isCancel && <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isApprove && 'Approve Time Off Request?'}
                {isReject && 'Reject Time Off Request?'}
                {isCancel && 'Cancel Time Off Request?'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {request.id} • {request.employee_code}
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

        {/* Request Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">{request.employee_name}</span> has requested{' '}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{request.leave_type_name}</span> from{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{formatDate(request.start_date)}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{formatDate(request.end_date)}</span>.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Total Duration:
            </span>
            <span className="font-bold text-slate-900 dark:text-white px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800">
              {parseFloat(request.days || "0")} day{parseFloat(request.days || "0") > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Optional Rejection Reason */}
        {isReject && (
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Reason for Rejection (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Provide a reason for rejecting this leave request..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleAction}
            disabled={isSubmitting}
            className={`px-5 py-2.5 rounded-2xl text-white font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 ${
              isApprove
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                : isReject
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
            }`}
          >
            {isSubmitting 
              ? 'Submitting...' 
              : isApprove 
                ? 'Approve Request'
                : isReject
                ? 'Reject Request'
                : 'Confirm Cancellation'}
          </button>
        </div>

      </div>
    </div>
  );
}
