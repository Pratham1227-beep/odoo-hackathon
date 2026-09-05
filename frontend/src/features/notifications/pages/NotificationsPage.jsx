import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationHeader from '../components/NotificationHeader';
import NotificationStats from '../components/NotificationStats';
import NotificationList from '../components/NotificationList';
import RecentActivity from '../components/RecentActivity';
import NotificationFilters from '../components/NotificationFilters';
import NotificationSettings from '../components/NotificationSettings';
import QuickActions from '../components/QuickActions';
import NotificationDetailModal from '../components/NotificationDetailModal';
import NotificationSettingsModal from '../components/NotificationSettingsModal';
import ArchivedNotificationsModal from '../components/ArchivedNotificationsModal';
import AllActivityModal from '../components/AllActivityModal';
import { notificationService } from '../services/notificationService';
import {
  initialNotifications,
  initialActivities,
  initialNotificationSettings,
} from '../data/notificationsData';
import { Loader2 } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();

  // Primary State
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activities, setActivities] = useState(initialActivities);
  const [settings, setSettings] = useState(initialNotificationSettings);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    dateRange: 'last7days',
    module: 'all',
    type: 'all',
    status: 'all',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: 'last7days',
    module: 'all',
    type: 'all',
    status: 'all',
  });

  // Modal States
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);
  const [isAllActivityOpen, setIsAllActivityOpen] = useState(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.listNotifications({ page: 1, page_size: 50 });
      if (res && res.items && res.items.length > 0) {
        const mapped = res.items.map((item) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          type: item.type || 'system',
          module: item.type?.toLowerCase().includes('pay') ? 'payroll' : item.type?.toLowerCase().includes('leave') ? 'timeoff' : 'system',
          status: item.is_read ? 'read' : 'unread',
          severity: item.severity || 'INFO',
          important: item.severity === 'HIGH' || item.severity === 'CRITICAL',
          mention: false,
          timestamp: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(item.created_at).toLocaleDateString(),
          link: item.link || null,
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Counts Calculation
  const counts = useMemo(() => {
    const nonArchived = notifications.filter((n) => n.status !== 'archived');
    return {
      all: nonArchived.length,
      unread: nonArchived.filter((n) => n.status === 'unread').length,
      important: nonArchived.filter((n) => n.important).length,
      mentions: nonArchived.filter((n) => n.mention).length,
      archived: notifications.filter((n) => n.status === 'archived').length,
    };
  }, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Must not be archived for standard tabs
      if (notif.status === 'archived') {
        return appliedFilters.status === 'archived';
      }

      // Tab filtering
      if (activeTab === 'unread' && notif.status !== 'unread') return false;
      if (activeTab === 'important' && !notif.important) return false;
      if (activeTab === 'mentions' && !notif.mention) return false;

      // Dropdown filter: Module
      if (appliedFilters.module !== 'all' && notif.module !== appliedFilters.module) {
        return false;
      }

      // Dropdown filter: Notification Type
      if (appliedFilters.type !== 'all' && notif.type !== appliedFilters.type) {
        return false;
      }

      // Dropdown filter: Status
      if (appliedFilters.status !== 'all' && notif.status !== appliedFilters.status) {
        return false;
      }

      return true;
    });
  }, [notifications, activeTab, appliedFilters]);

  const isFiltered =
    appliedFilters.module !== 'all' ||
    appliedFilters.type !== 'all' ||
    appliedFilters.status !== 'all' ||
    appliedFilters.dateRange !== 'last7days';

  // Actions
  const handleMarkAllAsRead = async () => {
    try {
      const unreadList = notifications.filter((n) => n.status === 'unread');
      await Promise.allSettled(unreadList.map((n) => notificationService.markAsRead(n.id)));
      setNotifications((prev) =>
        prev.map((n) => (n.status === 'unread' ? { ...n, status: 'read' } : n))
      );
      showToast('All notifications marked as read.');
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n.status === 'unread' ? { ...n, status: 'read' } : n))
      );
      showToast('All notifications marked as read.');
    }
  };

  const handleToggleRead = async (id) => {
    const target = notifications.find((n) => n.id === id);
    const newStatus = target?.status === 'unread' ? 'read' : 'unread';
    
    if (newStatus === 'read') {
      try {
        await notificationService.markAsRead(id);
      } catch (e) {
        // ignore if mock id
      }
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n))
    );
    showToast(newStatus === 'read' ? 'Marked as read.' : 'Marked as unread.');
  };

  const handleToggleImportant = (id) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const newImportant = !n.important;
          showToast(newImportant ? 'Marked as important.' : 'Removed from important.');
          return { ...n, important: newImportant };
        }
        return n;
      })
    );
  };

  const handleArchive = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'archived' } : n))
    );
    showToast('Notification archived.');
  };

  const handleRestore = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
    );
    showToast('Notification restored to active list.');
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification permanently deleted.');
  };

  const handleToggleSetting = (key) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast('Notification settings updated.');
      return updated;
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    showToast('Filters applied.');
  };

  const handleResetFilters = () => {
    const initial = {
      dateRange: 'last7days',
      module: 'all',
      type: 'all',
      status: 'all',
    };
    setFilters(initial);
    setAppliedFilters(initial);
    showToast('Filters reset.');
  };

  const handleNavigate = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const handleStatClick = (statKey) => {
    if (statKey === 'unread') {
      setActiveTab('unread');
    } else if (statKey === 'activities') {
      setIsAllActivityOpen(true);
    } else if (statKey === 'approvals') {
      setFilters((prev) => ({ ...prev, type: 'approval' }));
      setAppliedFilters((prev) => ({ ...prev, type: 'approval' }));
    } else if (statKey === 'system') {
      setFilters((prev) => ({ ...prev, module: 'system' }));
      setAppliedFilters((prev) => ({ ...prev, module: 'system' }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <NotificationHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* 4 Statistics KPI Cards */}
      <NotificationStats
        unreadCount={counts.unread}
        pendingApprovals={5}
        systemUpdates={3}
        todayActivities={28}
        onStatClick={handleStatClick}
      />

      {/* Main 3-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Notifications (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : (
            <NotificationList
              notifications={filteredNotifications}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              counts={counts}
              onSelectNotification={setSelectedNotification}
              onToggleRead={handleToggleRead}
              onToggleImportant={handleToggleImportant}
              onArchive={handleArchive}
              onNavigate={handleNavigate}
              onClearFilters={handleResetFilters}
              isFiltered={isFiltered}
            />
          )}
        </div>

        {/* Column 2: Recent Activity (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <RecentActivity
            activities={activities}
            onViewAllActivity={() => setIsAllActivityOpen(true)}
          />
        </div>

        {/* Column 3: Right Sidebar (3 cols - Filters, Settings, Quick Actions) */}
        <div className="lg:col-span-3 space-y-5">
          <NotificationFilters
            filters={filters}
            onChangeFilter={(key, value) =>
              setFilters((prev) => ({ ...prev, [key]: value }))
            }
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            isFiltered={isFiltered}
          />

          <NotificationSettings
            settings={settings}
            onToggleSetting={handleToggleSetting}
            onManageAllSettings={() => setIsSettingsOpen(true)}
          />

          <QuickActions
            onMarkAllAsRead={handleMarkAllAsRead}
            onViewArchived={() => setIsArchivedOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <NotificationDetailModal
        isOpen={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onToggleRead={handleToggleRead}
        onNavigate={handleNavigate}
      />

      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => showToast('Preferences saved successfully.')}
      />

      <ArchivedNotificationsModal
        isOpen={isArchivedOpen}
        onClose={() => setIsArchivedOpen(false)}
        archivedNotifications={notifications.filter((n) => n.status === 'archived')}
        onRestore={handleRestore}
        onDelete={handleDelete}
        onViewDetails={setSelectedNotification}
      />

      <AllActivityModal
        isOpen={isAllActivityOpen}
        onClose={() => setIsAllActivityOpen(false)}
        activities={activities}
      />
    </div>
  );
}
