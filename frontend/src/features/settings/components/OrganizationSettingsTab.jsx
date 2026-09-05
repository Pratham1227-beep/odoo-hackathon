import React from 'react';
import { Building2, Mail, Phone, Globe, Shield, Calendar } from 'lucide-react';

export default function OrganizationSettingsTab({ settings, onChange }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Organization Profile & Legal Identity</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          General business information used across generated payslips, tax forms, and contracts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Display Company Name
          </label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Company Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tenant Code
          </label>
          <input
            type="text"
            value={settings.companyCode}
            onChange={(e) => onChange('companyCode', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 uppercase"
          />
        </div>

        {/* Legal Entity */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Registered Legal Entity Name
          </label>
          <input
            type="text"
            value={settings.legalEntity}
            onChange={(e) => onChange('legalEntity', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Official HR / Payroll Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => onChange('contactEmail', e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Contact Helpline Phone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={(e) => onChange('contactPhone', e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* PAN & GSTIN */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Company PAN Number
          </label>
          <input
            type="text"
            value={settings.panNumber}
            onChange={(e) => onChange('panNumber', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            GSTIN Identification Number
          </label>
          <input
            type="text"
            value={settings.gstNumber}
            onChange={(e) => onChange('gstNumber', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 uppercase"
          />
        </div>

        {/* Currency & Financial Year */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Base Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => onChange('currency', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="INR (₹)">INR (₹) - Indian Rupee</option>
            <option value="USD ($)">USD ($) - US Dollar</option>
            <option value="EUR (€)">EUR (€) - Euro</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Financial Year Begins
          </label>
          <select
            value={settings.financialYearStart}
            onChange={(e) => onChange('financialYearStart', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="April">April (Indian Standard FY)</option>
            <option value="January">January (Calendar Year)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
