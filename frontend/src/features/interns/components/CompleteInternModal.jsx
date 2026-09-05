import React, { useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';

export default function CompleteInternModal({ isOpen, onClose, onConfirm, internName }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-md p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Complete Internship?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mark internship for <strong className="text-slate-900 dark:text-white">{internName}</strong> as officially completed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Internship'}
          </button>
        </div>
      </div>
    </div>
  );
}
