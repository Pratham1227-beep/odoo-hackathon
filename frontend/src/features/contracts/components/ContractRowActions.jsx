import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  Download,
  MoreVertical,
  Edit,
  RotateCw,
  Ban,
  Trash2,
  FileText,
} from 'lucide-react';

export default function ContractRowActions({
  contract,
  onViewContract,
  onEditContract,
  onDownloadContract,
  onRenewContract,
  onTerminateContract,
  onDeleteContract,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-end gap-1 relative" ref={menuRef}>
      {/* View Action */}
      <button
        type="button"
        onClick={() => onViewContract(contract)}
        title="View contract details"
        aria-label={`View contract for ${contract.employeeName}`}
        className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Download Action */}
      <button
        type="button"
        onClick={() => onDownloadContract(contract)}
        title="Download / preview document"
        aria-label={`Download document for ${contract.employeeName}`}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <Download className="w-4 h-4" />
      </button>

      {/* More Options Dropdown */}
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        title="More contract actions"
        aria-label={`More actions for ${contract.employeeName}`}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-40 text-xs animate-in fade-in duration-100">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onViewContract(contract);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            <span>View Contract</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onEditContract(contract);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-blue-500" />
            <span>Edit Contract</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onDownloadContract(contract);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Document</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onRenewContract(contract);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
            <span>Renew Contract</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onTerminateContract(contract);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-colors cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5 text-amber-500" />
            <span>Terminate Contract</span>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onDeleteContract(contract.id);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete Contract</span>
          </button>
        </div>
      )}
    </div>
  );
}
