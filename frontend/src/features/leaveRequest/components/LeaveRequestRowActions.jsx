import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  Edit2,
  Ban,
  User,
} from 'lucide-react';

export default function LeaveRequestRowActions({
  request,
  onViewDetails,
  onApprove,
  onReject,
  onEdit,
  onCancel,
}) {
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

  const isPending = request.status === 'Pending';
  const isApproved = request.status === 'Approved';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
        aria-label="Leave actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
          {/* View Request */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onViewDetails(request);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Request</span>
          </button>

          {/* Pending: Approve, Reject, Edit */}
          {isPending && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onApprove(request);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Approve</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onReject(request);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Reject</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onEdit(request);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit</span>
              </button>
            </>
          )}

          {/* Cancel (For Pending & Approved) */}
          {(isPending || isApproved) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onCancel(request);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors text-left cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5 text-amber-500" />
              <span>Cancel Request</span>
            </button>
          )}

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          {/* View Employee */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              navigate(`/employees/${request.employeeId}`);
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
