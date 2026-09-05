import React, { useState, useRef, useEffect } from 'react';
import { FileText, MoreVertical, Eye, Download, RefreshCw, Trash2 } from 'lucide-react';

export default function EmployeeDocumentsCard({ documents = [] }) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };

    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  const handleAction = (doc, action) => {
    setActiveMenuId(null);
    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${doc.title}?`)) {
        alert(`${doc.title} removed.`);
      }
    } else {
      alert(`${action.toUpperCase()} action for ${doc.title}`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4" ref={menuRef}>
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Documents
        </h3>
        <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
          View All
        </button>
      </div>

      {/* Document List */}
      <div className="space-y-3.5">
        {documents.map((doc) => {
          const isMenuOpen = activeMenuId === doc.id;

          return (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 p-1 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors relative"
            >
              {/* Icon & File Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    {doc.subtitle}
                  </p>
                </div>
              </div>

              {/* 3-dots Menu Button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuId(isMenuOpen ? null : doc.id)
                  }
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Document options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                    <button
                      onClick={() => handleAction(doc, 'view')}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleAction(doc, 'download')}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => handleAction(doc, 'replace')}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Replace</span>
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <button
                      onClick={() => handleAction(doc, 'delete')}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
