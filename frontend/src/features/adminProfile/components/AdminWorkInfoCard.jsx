import React from 'react';
import { Briefcase, Building, Shield, Calendar, Users, MapPin, CheckCircle, Edit3 } from 'lucide-react';

export default function AdminWorkInfoCard({ data, onEdit }) {
  const fields = [
    { label: 'Administrator ID', value: data.adminId, icon: Briefcase },
    { label: 'Tenant Organization', value: `${data.organization} (${data.tenantCode})`, icon: Building },
    { label: 'Administrative Role', value: data.role, icon: Shield },
    { label: 'Department', value: data.department, icon: Briefcase },
    { label: 'Onboarded Date', value: data.joinDate, icon: Calendar },
    { label: 'Access Scope', value: data.accessScope, icon: CheckCircle },
    { label: 'Managed Workforce', value: `${data.managedEmployees} Active Employees`, icon: Users },
    { label: 'Base Location', value: data.workLocation, icon: MapPin },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Governance & Work Information
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors cursor-pointer"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>

      {/* Field List */}
      <div className="space-y-3.5 divide-y divide-slate-50 dark:divide-slate-800/40">
        {fields.map((field, idx) => {
          const Icon = field.icon;
          return (
            <div
              key={field.label}
              className={`flex items-start justify-between gap-4 text-xs ${
                idx > 0 ? 'pt-3' : ''
              }`}
            >
              {/* Left Label with Icon */}
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 w-36 shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{field.label}</span>
              </div>

              {/* Right Value */}
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-right flex-1 truncate">
                {field.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
