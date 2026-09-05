import React from 'react';
import { Shield, KeyRound, Lock, Eye } from 'lucide-react';

export default function SecuritySettingsTab({ settings, onChange }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Security & Access Governance</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Two-factor verification enforcement, active session lifecycles, and audit logging parameters
        </p>
      </div>

      <div className="space-y-4">
        {/* MFA Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              Enforce Multi-Factor Authentication (MFA / 2FA)
            </h4>
            <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Require OTP authentication via email or authenticator app on every admin & HR user login.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.mfaEnforced}
            onClick={() => onChange('mfaEnforced', !settings.mfaEnforced)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              settings.mfaEnforced ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.mfaEnforced ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Audit Logging Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              Continuous Audit Trail & Event Logging
            </h4>
            <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Capture all critical wage adjustments, payslip releases, and role modifications in immutable audit store.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.auditLoggingEnabled}
            onClick={() => onChange('auditLoggingEnabled', !settings.auditLoggingEnabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              settings.auditLoggingEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.auditLoggingEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Session Timeout & Password Expiry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Idle Session Timeout (Minutes)
            </label>
            <select
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => onChange('sessionTimeoutMinutes', Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes (Recommended)</option>
              <option value={60}>60 Minutes</option>
              <option value={120}>120 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password Renewal Cycle (Days)
            </label>
            <select
              value={settings.passwordExpiryDays}
              onChange={(e) => onChange('passwordExpiryDays', Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value={60}>60 Days</option>
              <option value={90}>90 Days (Standard Corporate)</option>
              <option value={180}>180 Days</option>
              <option value={365}>Never Expire</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
