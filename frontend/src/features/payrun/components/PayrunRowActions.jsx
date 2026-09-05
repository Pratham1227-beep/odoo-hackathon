import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, FileText, RefreshCw, PauseCircle, PlayCircle, User, Trash2 } from 'lucide-react';

export default function PayrunRowActions({
  employee,
  onViewPayslip,
  onRecalculate,
  onToggleHold,
  onViewEmployee,
  onRemove,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOnHold = employee.status === 'On Hold';
  const isProcessed = employee.status === 'Processed';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-30 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
          {/* View Payslip */}
          <button
            onClick={() => {
              onViewPayslip(employee);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>View Payslip</span>
          </button>

          {/* Recalculate */}
          <button
            onClick={() => {
              onRecalculate(employee.id);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
            <span>Recalculate</span>
          </button>

          {/* Put On Hold / Release Hold */}
          <button
            onClick={() => {
              onToggleHold(employee.id);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
          >
            {isOnHold ? (
              <>
                <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Resume Payrun</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Put On Hold</span>
              </>
            )}
          </button>

          {/* View Employee */}
          <button
            onClick={() => {
              onViewEmployee(employee.id);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>View Employee</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          {/* Remove */}
          <button
            onClick={() => {
              onRemove(employee.id);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove from Run</span>
          </button>
        </div>
      )}
    </div>
  );
}
