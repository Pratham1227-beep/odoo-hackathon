import React, { useState } from 'react';
import { X, Layers, Check, Copy, Plus } from 'lucide-react';
import { initialShiftTemplates } from '../data/shiftTypesData';

export default function ShiftTemplateModal({
  isOpen,
  onClose,
  onApplyTemplate,
}) {
  const [templates, setTemplates] = useState(initialShiftTemplates);
  const [appliedId, setAppliedId] = useState(null);

  if (!isOpen) return null;

  const handleUseTemplate = (tpl) => {
    setAppliedId(tpl.id);
    if (onApplyTemplate) {
      onApplyTemplate(tpl);
    }
    setTimeout(() => {
      setAppliedId(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Shift Templates
              </h2>
              <p className="text-xs text-slate-400">
                Preconfigured templates to quickly apply schedules across teams.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/40 transition-all flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {tpl.name}
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {tpl.timing}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Active Days: {tpl.days.join(', ')} • {tpl.location}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUseTemplate(tpl)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                  appliedId === tpl.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                }`}
              >
                {appliedId === tpl.id ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Applied
                  </span>
                ) : (
                  'Use Template'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <span className="text-[11px] text-slate-400">
            {templates.length} templates available
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
