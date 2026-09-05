import React, { useState } from 'react';
import { X, Layers, Check, Copy, Trash2, ArrowRight } from 'lucide-react';
import { initialContractTemplates } from '../data/contractTemplatesData';

export default function ContractTemplatesModal({
  isOpen,
  onClose,
  onUseTemplate,
}) {
  const [templates, setTemplates] = useState(initialContractTemplates);
  const [appliedId, setAppliedId] = useState(null);

  if (!isOpen) return null;

  const handleUse = (tpl) => {
    setAppliedId(tpl.id);
    if (onUseTemplate) {
      onUseTemplate(tpl);
    }
    setTimeout(() => {
      setAppliedId(null);
      onClose();
    }, 1000);
  };

  const handleDuplicate = (tpl) => {
    const dup = {
      ...tpl,
      id: `TPL-${Date.now().toString().slice(-4)}`,
      name: `${tpl.name} (Copy)`,
    };
    setTemplates([...templates, dup]);
  };

  const handleDelete = (id) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Contract Templates
              </h2>
              <p className="text-slate-400 mt-0.5">
                Standard agreements for permanent staff, fixed contractors, and interns.
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

        {/* Templates List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tpl.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {tpl.contractType}
                  </span>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                  {tpl.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] font-medium text-slate-400">
                  <span>Duration: {tpl.duration}</span>
                  <span>Notice: {tpl.noticePeriod}</span>
                  <span>Hours: {tpl.workingHoursStart} – {tpl.workingHoursEnd}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleDuplicate(tpl)}
                  title="Duplicate template"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleUse(tpl)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    appliedId === tpl.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {appliedId === tpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected!</span>
                    </>
                  ) : (
                    <>
                      <span>Use Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <span className="text-[11px] text-slate-400">
            {templates.length} templates configured
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
