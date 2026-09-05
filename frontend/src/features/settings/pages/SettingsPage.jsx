import React, { useState, useEffect } from 'react';
import SettingsHeader from '../components/SettingsHeader';
import OrganizationSettingsTab from '../components/OrganizationSettingsTab';
import PayrollSettingsTab from '../components/PayrollSettingsTab';
import AttendanceSettingsTab from '../components/AttendanceSettingsTab';
import SecuritySettingsTab from '../components/SecuritySettingsTab';
import { initialSettings } from '../data/settingsData';
import { settingsService } from '../services/settingsService';
import { Building2, Coins, Clock, Shield, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('wagewise_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [activeTab, setActiveTab] = useState('organization');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchLiveSettings = async () => {
      try {
        setLoading(true);
        const [orgRes, payrollRes] = await Promise.allSettled([
          settingsService.getOrganization(),
          settingsService.getPayrollConfig(),
        ]);

        setSettings((prev) => {
          let updated = { ...prev };
          if (orgRes.status === 'fulfilled' && orgRes.value) {
            const org = orgRes.value;
            updated = {
              ...updated,
              companyName: org.name || updated.companyName,
              companyCode: org.code || updated.companyCode,
              legalEntity: org.legal_name || org.name || updated.legalEntity,
              contactEmail: org.email || updated.contactEmail,
              contactPhone: org.phone || updated.contactPhone,
              panNumber: org.pan || updated.panNumber,
              gstNumber: org.gstin || updated.gstNumber,
              currency: org.currency ? `${org.currency} (₹)` : updated.currency,
            };
          }
          if (payrollRes.status === 'fulfilled' && payrollRes.value) {
            const pc = payrollRes.value;
            updated = {
              ...updated,
              payCycleCutoffDay: pc.cut_off_day || updated.payCycleCutoffDay,
              standardWorkHoursPerDay: pc.work_hours_per_day || updated.standardWorkHoursPerDay,
              overtimeMultiplier: pc.overtime_multiplier || updated.overtimeMultiplier,
            };
          }
          return updated;
        });
      } catch (err) {
        console.error('Error fetching live settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save locally
      localStorage.setItem('wagewise_settings', JSON.stringify(settings));

      // Attempt live backend update for org & payroll configs
      await Promise.allSettled([
        settingsService.updateOrganization({
          name: settings.companyName,
          legal_name: settings.legalEntity,
          email: settings.contactEmail,
          phone: settings.contactPhone,
          pan: settings.panNumber,
          gstin: settings.gstNumber,
        }),
        settingsService.updatePayrollConfig({
          cut_off_day: Number(settings.payCycleCutoffDay) || 25,
          work_hours_per_day: Number(settings.standardWorkHoursPerDay) || 8,
          overtime_multiplier: Number(settings.overtimeMultiplier) || 1.5,
        }),
      ]);

      showToast('Settings successfully updated and applied.');
    } catch (err) {
      showToast('Settings saved locally.');
    } finally {
      setIsSaving(false);
    }
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
