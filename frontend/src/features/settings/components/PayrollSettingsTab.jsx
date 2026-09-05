import React from 'react';
import { Coins, Percent, Calendar, ShieldCheck } from 'lucide-react';

export default function PayrollSettingsTab({ settings, onChange }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Coins className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Payroll & Statutory Compliance Parameters</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Define EPF contribution splits, ESIC limits, Professional Tax jurisdiction, and monthly cutoff cycles
        </p>
      </div>

      {/* Pay Cycle Schedule */}
      <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
        <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider mb-3">
          Monthly Pay Cycle Window
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Attendance Cutoff Date
            </label>
            <select
              value={settings.payCycleCutoffDay}
              onChange={(e) => onChange('payCycleCutoffDay', Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value={20}>20th of the month</option>
              <option value={25}>25th of the month (Standard)</option>
              <option value={28}>28th of the month</option>
              <option value={30}>End of the month</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Disbursal Date
            </label>
            <select
              value={settings.salaryPaymentDay}
              onChange={(e) => onChange('salaryPaymentDay', e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Last Working Day">Last Working Day of Month</option>
              <option value="1st of next month">1st of following month</option>
              <option value="5th of next month">5th of following month</option>
            </select>
          </div>
        </div>
      </div>

      {/* EPFO & ESIC Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provident Fund */}
        <div className="space-y-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Provident Fund (EPFO) Rules</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Employee Share (%)
              </label>
              <input
                type="number"
                value={settings.pfEmployeePercent}
                onChange={(e) => onChange('pfEmployeePercent', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Employer Share (%)
              </label>
              <input
                type="number"
                value={settings.pfEmployerPercent}
                onChange={(e) => onChange('pfEmployerPercent', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Statutory Wage Cap (₹ / Month)
            </label>
            <input
              type="number"
              value={settings.pfWageCap}
              onChange={(e) => onChange('pfWageCap', Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* ESIC */}
        <div className="space-y-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Employee State Insurance (ESIC)</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Employee Share (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={settings.esiEmployeePercent}
                onChange={(e) => onChange('esiEmployeePercent', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Employer Share (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={settings.esiEmployerPercent}
                onChange={(e) => onChange('esiEmployerPercent', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              ESIC Eligibility Wage Ceiling (₹)
            </label>
            <input
              type="number"
              value={settings.esiWageCap}
              onChange={(e) => onChange('esiWageCap', Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
