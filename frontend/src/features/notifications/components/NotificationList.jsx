import React, { useState } from 'react';
import { ChevronDown, CheckCheck, BellOff, Sparkles } from 'lucide-react';
import NotificationTabs from './NotificationTabs';
import NotificationItem from './NotificationItem';

export default function NotificationList({
  notifications = [],
  activeTab = 'all',
  onChangeTab,
  counts,
  onSelectNotification,
  onToggleRead,
  onToggleImportant,
  onArchive,
  onNavigate,
  onClearFilters,
  isFiltered = false,
}) {
  const [displayCount, setDisplayCount] = useState(8);

  const displayedNotifications = notifications.slice(0, displayCount);
  const hasMore = displayCount < notifications.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs">
      {/* Card Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Notifications
        </h2>
      </div>

      {/* Tabs */}
      <NotificationTabs
        activeTab={activeTab}
        onChangeTab={(tab) => {
          onChangeTab(tab);
          setDisplayCount(8);
        }}
        counts={counts}
      />

      {/* List */}
      <div className="mt-4 space-y-1.5 min-h-[380px]">
        {displayedNotifications.length > 0 ? (
          displayedNotifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onSelect={onSelectNotification}
              onToggleRead={onToggleRead}
              onToggleImportant={onToggleImportant}
              onArchive={onArchive}
              onNavigate={onNavigate}
            />
          ))
        ) : (
          /* Empty States */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-4">
              {activeTab === 'unread' ? (
                <CheckCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              ) : isFiltered ? (
                <BellOff className="w-7 h-7 text-slate-400" />
              ) : (
                <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {activeTab === 'unread'
                ? "You're all caught up!"
                : activeTab === 'important'
                ? 'No important notifications'
                : activeTab === 'mentions'
                ? 'No mentions yet'
                : isFiltered
                ? 'No matching notifications found'
                : 'No notifications'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              {activeTab === 'unread'
                ? 'There are no unread notifications requiring your immediate attention.'
                : isFiltered
                ? 'Try resetting your filters or adjusting criteria to see results.'
                : 'All alerts and updates across HR & Payroll will appear here.'}
            </p>

            {isFiltered && (
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Load More */}
      {notifications.length > 8 && (
        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          {hasMore ? (
            <button
              type="button"
              onClick={handleLoadMore}
              className="w-full py-2.5 inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
            >
              <span>Load More Notifications</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-2">
              All notifications loaded
            </p>
          )}
        </div>
      )}
    </div>
  );
}
