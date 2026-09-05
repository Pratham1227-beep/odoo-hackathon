import React from 'react';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function AdminPermissionsCard({ permissions }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>System Role & Module Permissions</span>
        </h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
          Super Admin Scope
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {permissions.map((perm) => (
          <div
            key={perm.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {perm.name}
              </span>
            </div>
            <span className="text-2xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md shrink-0">
              {perm.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
