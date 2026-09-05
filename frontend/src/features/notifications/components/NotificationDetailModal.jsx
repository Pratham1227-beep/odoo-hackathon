import React from 'react';
import {
  X,
  Clock,
  User,
  ExternalLink,
  Check,
  RotateCcw,
  AlertTriangle,
  FolderTree,
  ShieldAlert,
} from 'lucide-react';

export default function NotificationDetailModal({
  isOpen,
  onClose,
  notification,
  onToggleRead,
  onNavigate,
}) {
  if (!isOpen || !notification) return null;

  const isUnread = notification.status === 'unread';

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'important':
      case 'high':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'critical':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'low':
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider border mb-2 ${getPriorityBadge(
                notification.priority
              )}`}
            >
              {notification.category || 'Notification'} • {notification.type || 'Alert'}
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {notification.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-4 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800/60">
            {notification.description}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50/70 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Created At</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {notification.time} ({notification.timestamp ? new Date(notification.timestamp).toLocaleDateString() : 'Recent'})
              </p>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <FolderTree className="w-3.5 h-3.5" />
                <span>Module</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {notification.module || 'System'}
              </p>
            </div>

            {notification.actor && (
              <div className="bg-slate-50/70 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Related Actor</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {notification.actor.name}{' '}
                  {notification.actor.role ? `(${notification.actor.role})` : ''}
                </p>
              </div>
            )}

            <div className="bg-slate-50/70 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Status</span>
              </div>
              <p
                className={`font-semibold capitalize ${
                  isUnread ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {notification.status}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onToggleRead(notification.id);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            {isUnread ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark as Read</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Mark as Unread</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {notification.route && (
              <button
                type="button"
                onClick={() => {
                  onNavigate(notification.route);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
              >
                <span>Go to {notification.category}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
