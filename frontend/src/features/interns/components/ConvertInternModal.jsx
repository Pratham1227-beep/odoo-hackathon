import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

export default function ConvertInternModal({ isOpen, onClose, onConfirm, internName, domain }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConvert = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to convert intern');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-md p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Convert Intern to Employee?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-900 dark:text-white">{internName}</strong> will be converted from{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{domain} Intern</span> to an active
            full-time employee.
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 text-left space-y-1">
          <p>✓ Existing personal information, email, and phone preserved.</p>
          <p>✓ Attendance history and org association maintained.</p>
          <p>✓ Internship record preserved for historical record.</p>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl">{error}</div>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Convert to Employee</span>
          </button>
        </div>
      </div>
    </div>
  );
}
