import React from 'react';
import { Shield, KeyRound, Smartphone, Clock, Lock, CheckCircle2 } from 'lucide-react';

export default function AdminSecurityCard({ security, onChangePassword }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Security & Authentication Status</span>
        </h3>
        <button
          type="button"
          onClick={onChangePassword}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Change Password</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
          <span className="text-2xs font-semibold text-slate-400 uppercase flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
            <span>Two-Factor Authentication</span>
          </span>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Active & Enforced</span>
          </div>
          <p className="text-2xs text-slate-500 dark:text-slate-400">{security.mfaMethod}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
          <span className="text-2xs font-semibold text-slate-400 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Last Activity / Session</span>
          </span>
          <div className="font-bold text-slate-900 dark:text-white pt-1">
            {security.lastLogin}
          </div>
          <p className="text-2xs text-slate-500 dark:text-slate-400">{security.sessionExpiry}</p>
        </div>
      </div>

      {/* Security Score Meter */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-700 dark:text-slate-300">Tenant Account Security Score</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{security.securityScore}% (High)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            style={{ width: `${security.securityScore}%` }}
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
}
