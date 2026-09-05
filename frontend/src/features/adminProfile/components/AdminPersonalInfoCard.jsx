import React from 'react';
import { User, Mail, Phone, Calendar, CircleDot, MapPin, Edit3, HeartHandshake } from 'lucide-react';

export default function AdminPersonalInfoCard({ data, onEdit }) {
  const fields = [
    { label: 'Full Name', value: data.fullName, icon: User },
    { label: 'Email', value: data.email, icon: Mail },
    { label: 'Phone', value: data.phone, icon: Phone },
    { label: 'Date of Birth', value: data.dateOfBirth, icon: Calendar },
    { label: 'Gender', value: data.gender, icon: CircleDot },
    { label: 'Address', value: data.address, icon: MapPin, isMultiLine: true },
    {
      label: 'Emergency Contact',
      value: data.emergencyContact
        ? `${data.emergencyContact.name} (${data.emergencyContact.relationship})\n${data.emergencyContact.phone}`
        : 'Not set',
      icon: HeartHandshake,
      isMultiLine: true,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Personal Information
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
              <div
                className={`font-semibold text-slate-900 dark:text-slate-100 text-right flex-1 ${
                  field.isMultiLine ? 'whitespace-pre-line leading-relaxed' : 'truncate'
                }`}
              >
                {field.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
