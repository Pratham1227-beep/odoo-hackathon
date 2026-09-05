import React, { useState, useEffect } from 'react';
import SettingsHeader from '../components/SettingsHeader';
import OrganizationSettingsTab from '../components/OrganizationSettingsTab';
import PayrollSettingsTab from '../components/PayrollSettingsTab';
import AttendanceSettingsTab from '../components/AttendanceSettingsTab';
import SecuritySettingsTab from '../components/SecuritySettingsTab';
import { initialSettings } from '../data/settingsData';
import { Building2, Coins, Clock, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('wagewise_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [activeTab, setActiveTab] = useState('organization');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('wagewise_settings', JSON.stringify(settings));
      setIsSaving(false);
      showToast('Settings successfully updated and applied.');
    }, 400);
  };

  const tabs = [
    { id: 'organization', label: 'Organization & Profile', icon: Building2 },
    { id: 'payroll', label: 'Payroll & Statutory Rules', icon: Coins },
    { id: 'attendance', label: 'Attendance & Shifts', icon: Clock },
    { id: 'security', label: 'Security & Access', icon: Shield },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <SettingsHeader onSave={handleSave} isSaving={isSaving} />

      {/* Settings Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {activeTab === 'organization' && (
        <OrganizationSettingsTab settings={settings} onChange={handleChange} />
      )}
      {activeTab === 'payroll' && (
        <PayrollSettingsTab settings={settings} onChange={handleChange} />
      )}
      {activeTab === 'attendance' && (
        <AttendanceSettingsTab settings={settings} onChange={handleChange} />
      )}
      {activeTab === 'security' && (
        <SecuritySettingsTab settings={settings} onChange={handleChange} />
      )}
    </div>
  );
}
