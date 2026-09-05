import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  FileText,
  UserPlus,
  Bell,
  AlertTriangle,
  Calendar,
  CheckCircle,
  MoreVertical,
  Star,
  Archive,
  ExternalLink,
  Check,
  Eye,
} from 'lucide-react';

export default function NotificationItem({
  notification,
  onSelect,
  onToggleRead,
  onToggleImportant,
  onArchive,
  onNavigate,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Icon mapping
  const renderIcon = () => {
    const iconClass = 'w-4.5 h-4.5';
    switch (notification.icon) {
      case 'Clock':
        return <Clock className={iconClass} />;
      case 'FileText':
        return <FileText className={iconClass} />;
      case 'UserPlus':
        return <UserPlus className={iconClass} />;
      case 'Bell':
        return <Bell className={iconClass} />;
      case 'AlertTriangle':
        return <AlertTriangle className={iconClass} />;
      case 'Calendar':
        return <Calendar className={iconClass} />;
      case 'CheckCircle':
        return <CheckCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  // Color container mapping
  const getColorStyles = () => {
    switch (notification.colorType) {
      case 'amber':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400';
      case 'purple':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400';
      case 'teal':
        return 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400';
      case 'rose':
        return 'bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400';
      case 'blue':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const isUnread = notification.status === 'unread';

  return (
    <div
      onClick={() => onSelect(notification)}
      className={`group relative flex items-start gap-3.5 p-3 sm:p-3.5 rounded-2xl transition-all duration-150 cursor-pointer border ${
        isUnread
          ? 'bg-slate-50/70 dark:bg-slate-800/40 border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:border-slate-200/60 dark:hover:border-slate-700/60'
          : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
      }`}
    >
      {/* Category Icon Badge */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${getColorStyles()}`}
      >
        {renderIcon()}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <h4
            className={`text-xs sm:text-sm font-semibold truncate ${
              isUnread
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-700 dark:text-slate-300 font-medium'
            }`}
          >
            {notification.title}
          </h4>
          {notification.important && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Important" />
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
          {notification.description}
        </p>
      </div>

      {/* Right Column: Timestamp, Unread Red Dot, Menu */}
      <div className="flex items-center gap-2.5 shrink-0 self-start mt-0.5">
        <span className="text-2xs sm:text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
          {notification.time}
        </span>

        {/* Unread indicator dot */}
        {isUnread && (
          <span
            className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ring-2 ring-white dark:ring-slate-900"
            aria-label="Unread"
          />
        )}

        {/* Action Menu (Three Dots) */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
            >
              <button
                type="button"
                onClick={() => {
                  onToggleRead(notification.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <Check className="w-3.5 h-3.5 text-slate-400" />
                <span>{isUnread ? 'Mark as Read' : 'Mark as Unread'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleImportant(notification.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    notification.important ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                  }`}
                />
                <span>{notification.important ? 'Unmark Important' : 'Mark as Important'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelect(notification);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>View Details</span>
              </button>

              {notification.route && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(notification.route);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Go to Module</span>
                </button>
              )}

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                type="button"
                onClick={() => {
                  onArchive(notification.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Notification</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
