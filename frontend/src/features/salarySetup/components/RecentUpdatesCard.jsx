import React, { useState } from 'react';
import { Clock, X, ChevronRight } from 'lucide-react';

export default function RecentUpdatesCard({ updates }) {
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Updates
          </h3>
          <button
            type="button"
            onClick={() => setIsViewAllOpen(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Timeline */}
        <div className="relative pl-5 space-y-5">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />

          {updates.slice(0, 3).map((item) => {
            return (
              <div key={item.id} className="relative flex items-start group">
                {/* Dot */}
                <div
                  className={`absolute -left-5 mt-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ring-2 ring-slate-100 dark:ring-slate-800 ${item.iconColor}`}
                />
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    By {item.author} • {item.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View All Modal */}
      {isViewAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Salary Configuration History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViewAllOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3.5 pr-1">
              {updates.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {item.details || 'Configuration adjustment made by ' + item.author}
                  </p>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold pt-0.5">
                    Authorized by {item.author}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsViewAllOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
