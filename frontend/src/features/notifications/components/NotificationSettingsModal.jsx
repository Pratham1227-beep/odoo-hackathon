import React, { useState } from 'react';
import { X, Check, Bell, Mail, Smartphone, Monitor } from 'lucide-react';

export default function NotificationSettingsModal({ isOpen, onClose, onSave }) {
  const [channels, setChannels] = useState({
    // Payroll
    payroll_completed_email: true,
    payroll_completed_push: true,
    payroll_completed_inapp: true,
    payroll_failed_email: true,
    payroll_failed_push: true,
    payroll_failed_inapp: true,
    payroll_validation_email: false,
    payroll_validation_push: true,
    payroll_validation_inapp: true,

    // Leave & Attendance
    leave_requests_email: true,
    leave_requests_push: true,
    leave_requests_inapp: true,
    overtime_alerts_email: true,
    overtime_alerts_push: false,
    overtime_alerts_inapp: true,

    // Employees
    employee_onboarding_email: true,
    employee_onboarding_push: true,
    employee_onboarding_inapp: true,
    profile_updates_email: false,
    profile_updates_push: false,
    profile_updates_inapp: true,

    // Contracts
    contracts_expiry_email: true,
    contracts_expiry_push: true,
    contracts_expiry_inapp: true,

    // Working Schedules
    schedule_updates_email: false,
    schedule_updates_push: true,
    schedule_updates_inapp: true,

    // System
    system_updates_email: false,
    system_updates_push: false,
    system_updates_inapp: true,
  });

  if (!isOpen) return null;

  const toggleChannel = (key) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: 'Payroll Notifications',
      description: 'Alerts related to payrun processing, validation gates, and payslip generation.',
      items: [
        { id: 'payroll_completed', label: 'Payrun Completed' },
        { id: 'payroll_failed', label: 'Payrun Failed / Critical Errors' },
        { id: 'payroll_validation', label: 'Validation Warnings & Missing Info' },
      ],
    },
    {
      title: 'Leave & Attendance',
      description: 'Employee time off, overtime limit warnings, and manager approvals.',
      items: [
        { id: 'leave_requests', label: 'Leave Request Pending Approval' },
        { id: 'overtime_alerts', label: 'Overtime Policy Threshold Reached' },
      ],
    },
    {
      title: 'Employee Management',
      description: 'Staff onboarding, document changes, and profile edits.',
      items: [
        { id: 'employee_onboarding', label: 'New Employee Onboarding' },
        { id: 'profile_updates', label: 'Employee Profile Details Updated' },
      ],
    },
    {
      title: 'Contracts',
      description: 'Employment contract creation, 30-day expiration, and renewals.',
      items: [
        { id: 'contracts_expiry', label: 'Contract Expiring Soon Warnings' },
      ],
    },
    {
      title: 'Working Schedules & Shifts',
      description: 'Roster modifications, rotational shifts, and holiday declarations.',
      items: [
        { id: 'schedule_updates', label: 'Team Work Schedule Updated' },
      ],
    },
    {
      title: 'System & Maintenance',
      description: 'Product releases, platform audit logs, and maintenance windows.',
      items: [
        { id: 'system_updates', label: 'Platform Updates & Releases' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Notification Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure delivery channels across Email, Push, and In-App notifications.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 custom-scrollbar">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="text-2xs text-slate-500 dark:text-slate-400">
                    {section.description}
                  </p>
                </div>
                {/* Column Legend */}
                <div className="flex items-center gap-6 text-2xs font-semibold text-slate-400 pr-2">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                  <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Push</span>
                  <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> In-App</span>
                </div>
              </div>

              <div className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>

                    <div className="flex items-center gap-7 pr-2">
                      {/* Email Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleChannel(`${item.id}_email`)}
                        className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          channels[`${item.id}_email`]
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {channels[`${item.id}_email`] && <Check className="w-3 h-3" />}
                      </button>

                      {/* Push Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleChannel(`${item.id}_push`)}
                        className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          channels[`${item.id}_push`]
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {channels[`${item.id}_push`] && <Check className="w-3 h-3" />}
                      </button>

                      {/* In-App Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleChannel(`${item.id}_inapp`)}
                        className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          channels[`${item.id}_inapp`]
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {channels[`${item.id}_inapp`] && <Check className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSave) onSave(channels);
              onClose();
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
