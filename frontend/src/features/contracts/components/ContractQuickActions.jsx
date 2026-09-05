import React from 'react';
import { FilePlus, Layers, UploadCloud } from 'lucide-react';

export default function ContractQuickActions({
  onOpenCreateModal,
  onOpenTemplatesModal,
  onOpenImportModal,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs text-xs space-y-3.5">
      <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
        Quick Actions
      </h3>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Create Contract Action */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-100/80 dark:border-indigo-800/60 transition-all group cursor-pointer text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110">
            <FilePlus className="w-4 h-4" />
          </div>
          <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            Create Contract
          </span>
        </button>

        {/* Contract Templates Action */}
        <button
          type="button"
          onClick={onOpenTemplatesModal}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50/60 hover:bg-purple-100/80 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 border border-purple-100/80 dark:border-purple-800/60 transition-all group cursor-pointer text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
            Contract Templates
          </span>
        </button>

        {/* Import Contracts Action */}
        <button
          type="button"
          onClick={onOpenImportModal}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-100/80 dark:border-blue-800/60 transition-all group cursor-pointer text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110">
            <UploadCloud className="w-4 h-4" />
          </div>
          <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Import Contracts
          </span>
        </button>
      </div>
    </div>
  );
}
