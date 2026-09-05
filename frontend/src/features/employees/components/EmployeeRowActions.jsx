import React, { useState, useRef, useEffect } from 'react';
import {
  Edit3,
  MoreHorizontal,
  Eye,
  FileText,
  Clock,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmployeeRowActions({ employee, onEdit }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative inline-flex items-center gap-1" ref={menuRef}>
      {/* Quick Edit Icon */}
      <button
        type="button"
        onClick={() => onEdit(employee)}
        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        aria-label={`Edit ${employee.name}`}
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {/* 3-dots Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        aria-label="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
          <button
            type="button"
            onClick={() => handleActionClick(`/employees/${employee.id}`)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Employee</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit(employee);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Employee</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            type="button"
            onClick={() => handleActionClick(`/payroll?employee=${employee.id}`)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>View Contract</span>
          </button>

          <button
            type="button"
            onClick={() => handleActionClick(`/attendance?employee=${employee.id}`)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>View Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => handleActionClick(`/leave-management?employee=${employee.id}`)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>View Time Off</span>
          </button>
        </div>
      )}
    </div>
  );
}
