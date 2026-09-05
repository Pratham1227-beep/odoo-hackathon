import React from 'react';
import {
  CreditCard,
  Building2,
  Briefcase,
  Clock,
  Calendar,
  UserCheck,
  MapPin,
  Edit3
} from 'lucide-react';

export default function WorkInfoCard({ data, onEdit }) {
  const fields = [
    { label: 'Employee ID', value: data.employeeId, icon: CreditCard },
    { label: 'Department', value: data.department, icon: Building2 },
    { label: 'Designation', value: data.designation, icon: Briefcase },
    { label: 'Employment Type', value: data.employmentType, icon: Clock },
    { label: 'Join Date', value: data.joinDate, icon: Calendar },
    { label: 'Reporting Manager', value: data.reportingManager, icon: UserCheck },
    { label: 'Work Location', value: data.workLocation, icon: MapPin },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Work Information
        </h3>
        <button
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
