import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, User, AlertCircle, CheckCircle2, UserX } from 'lucide-react';

export default function EmployeeIssueRowActions({
  issue,
  onViewEmployee,
  onResolve,
  onExclude,
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

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-30 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
          <button
            onClick={() => {
              onResolve(issue);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-left cursor-pointer font-medium"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolve Issue</span>
          </button>

          <button
            onClick={() => {
              onViewEmployee(issue.employeeId);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>View Employee Profile</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            onClick={() => {
              onExclude(issue.id);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Exclude from Run</span>
          </button>
        </div>
      )}
    </div>
  );
}
