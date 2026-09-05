import React from 'react';
import { Send, ArrowRight } from 'lucide-react';

export default function RequestTimeOffCard({ onOpenNewRequest }) {
  return (
    <div className="relative rounded-3xl bg-indigo-50/70 dark:bg-slate-900 border border-indigo-100/80 dark:border-slate-800/80 p-5 sm:p-6 space-y-4 shadow-xs overflow-hidden">
      {/* 3D-styled Floating Icon */}
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
          <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      {/* Copy */}
      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Request Time Off
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Submit a new leave request in just a few clicks.
        </p>
      </div>

      {/* Action Button */}
      <div>
        <button
          onClick={onOpenNewRequest}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.01]"
        >
          <span>New Request</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
