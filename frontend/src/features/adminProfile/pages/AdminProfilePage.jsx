import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Edit3,
  ChevronDown,
  KeyRound,
  Settings,
  Coins,
  Activity,
  Download,
  ShieldCheck,
  Building,
} from 'lucide-react';
import AdminProfileHeader from '../components/AdminProfileHeader';
import AdminProfileTabs from '../components/AdminProfileTabs';
import AdminPersonalInfoCard from '../components/AdminPersonalInfoCard';
import AdminWorkInfoCard from '../components/AdminWorkInfoCard';
import AdminPermissionsCard from '../components/AdminPermissionsCard';
import AdminSecurityCard from '../components/AdminSecurityCard';
import AdminQuickActions from '../components/AdminQuickActions';
import AdminActivityTimeline from '../components/AdminActivityTimeline';
import EditAdminProfileModal from '../components/EditAdminProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { defaultAdminProfile } from '../data/adminProfileData';
import { useAuthStore } from '../../../store/useAuthStore';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const { user, organization } = useAuthStore();

  const [admin, setAdmin] = useState(() => {
    return {
      ...defaultAdminProfile,
      name: user?.email ? user.email.split('@')[0].replace('.', ' ').toUpperCase() : defaultAdminProfile.name,
      email: user?.email || defaultAdminProfile.email,
      organization: organization?.name || defaultAdminProfile.workInformation.organization,
      personalInformation: {
        ...defaultAdminProfile.personalInformation,
        fullName: user?.email ? user.email.split('@')[0].replace('.', ' ').toUpperCase() : defaultAdminProfile.personalInformation.fullName,
        email: user?.email || defaultAdminProfile.personalInformation.email,
      },
      workInformation: {
        ...defaultAdminProfile.workInformation,
        organization: organization?.name || defaultAdminProfile.workInformation.organization,
      },
    };
  });

  const [activeTab, setActiveTab] = useState('Overview');
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const moreActionsRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target)) {
        setShowMoreActions(false);
      }
    };
    if (showMoreActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreActions]);

  const handleMoreAction = (action) => {
    setShowMoreActions(false);
    if (action === 'password') setIsChangePasswordOpen(true);
    else if (action === 'settings') navigate('/settings');
    else if (action === 'payroll') navigate('/settings/payroll');
    else if (action === 'activity') navigate('/notifications/activity');
    else if (action === 'download') showToast(`Exporting administrative audit credentials for ${admin.name}...`);
  };

  const handleSaveProfile = (formData) => {
    setAdmin((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      designation: formData.designation,
      quote: {
        ...prev.quote,
        text: formData.quoteText,
      },
      personalInformation: {
        ...prev.personalInformation,
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
      },
    }));
    showToast('Administrator profile updated successfully.');
  };
 


  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link
            to="/dashboard"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <Link
            to="/settings"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Administration
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <span className="text-slate-900 dark:text-white font-bold">
            Administrator Profile
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>

        
          

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/90 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative" ref={moreActionsRef}>
            <button
              type="button"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <span>Administrative Actions</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showMoreActions && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                <button
                  type="button"
                  onClick={() => handleMoreAction('password')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>Change Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoreAction('settings')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Organization Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoreAction('payroll')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payroll Configuration</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoreAction('activity')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span>System Audit Logs</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={() => handleMoreAction('download')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Admin Credentials</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Large Profile Header Card */}
      <AdminProfileHeader admin={admin} />

      {/* Navigation Tabs */}
      <AdminProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content Display */}
      {activeTab === 'Overview' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Main Left Column (8 cols) */}
          <div className="xl:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminPersonalInfoCard
                data={admin.personalInformation}
                onEdit={() => setIsEditModalOpen(true)}
              />
              <AdminWorkInfoCard
                data={admin.workInformation}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>

            <AdminPermissionsCard permissions={admin.permissions} />

            <AdminSecurityCard
              security={admin.security}
              onChangePassword={() => setIsChangePasswordOpen(true)}
            />
          </div>

          {/* Right Column (4 cols) */}
          <div className="xl:col-span-4 space-y-6">
            <AdminQuickActions />
            <AdminActivityTimeline activities={admin.recentActivities} />
          </div>
        </div>
      ) : activeTab === 'Personal' ? (
        <div className="max-w-3xl space-y-6">
          <AdminPersonalInfoCard
            data={admin.personalInformation}
            onEdit={() => setIsEditModalOpen(true)}
          />
        </div>
      ) : activeTab === 'Role' ? (
        <div className="space-y-6">
          <AdminWorkInfoCard
            data={admin.workInformation}
            onEdit={() => setIsEditModalOpen(true)}
          />
          <AdminPermissionsCard permissions={admin.permissions} />
        </div>
      ) : activeTab === 'Security' ? (
        <div className="max-w-3xl space-y-6">
          <AdminSecurityCard
            security={admin.security}
            onChangePassword={() => setIsChangePasswordOpen(true)}
          />
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          <AdminActivityTimeline activities={admin.recentActivities} />
        </div>
      )}

      {/* Modals */}
      <EditAdminProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        admin={admin}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={showToast}
      />
    </div>
  );
}
