import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Eye,
  Edit2,
  LogIn,
  LogOut,
  FileText,
  User,
} from 'lucide-react';

export default function AttendanceRowActions({
  record,
  onViewDetails,
  onEditAttendance,
  onQuickCheckIn,
  onQuickCheckOut,
  onAddNote,
  isHr = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const hasCheckIn = record.checkIn && record.checkIn !== '-';
  const hasCheckOut = record.checkOut && record.checkOut !== '-';
  const profileId = record.employeeUuid || record.employeeId;

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

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
        aria-label="Attendance actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
          <button
            onClick={() => {
              setIsOpen(false);
              onViewDetails(record);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Attendance</span>
          </button>

          {isHr && (
            <button
              onClick={() => {
                setIsOpen(false);
                onEditAttendance(record);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit Attendance</span>
            </button>
          )}

          {!hasCheckIn ? (
            <button
              onClick={() => {
                setIsOpen(false);
                onQuickCheckIn(record);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isHr ? 'Mark Check In' : 'Clock In'}</span>
            </button>
          ) : !hasCheckOut ? (
            <button
              onClick={() => {
                setIsOpen(false);
                onQuickCheckOut(record);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isHr ? 'Mark Check Out' : 'Clock Out'}</span>
            </button>
          ) : null}

          {isHr && (
            <button
              onClick={() => {
                setIsOpen(false);
                onAddNote(record);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Note</span>
            </button>
          )}

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            onClick={() => {
              setIsOpen(false);
              navigate(`/employees/${profileId}`);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-left cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-indigo-500" />
            <span>View Employee</span>
          </button>
        </div>
      )}
    </div>
  );
}
