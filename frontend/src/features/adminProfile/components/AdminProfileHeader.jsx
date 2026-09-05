import React from 'react';
import { Mail, Phone, MapPin, Quote, ShieldCheck, Crown } from 'lucide-react';

export default function AdminProfileHeader({ admin }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      {/* Left Column: Avatar + Basic Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Large Circular Avatar with Online/Active Indicator */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/60 shadow-sm bg-indigo-600 text-white flex items-center justify-center">
            {admin.avatarUrl ? (
              <img
                src={admin.avatarUrl}
                alt={admin.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold tracking-wider">
                {admin.initials || 'AA'}
              </span>
            )}
          </div>
          {/* Active Status Dot */}
          <span className="absolute bottom-1 right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 ring-3 ring-white dark:ring-slate-900 shadow-xs" />
        </div>

        {/* Name, Badges & Contact Row */}
        <div className="space-y-2">
          {/* Name & ID */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{admin.name}</span>
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
            </h1>
          </div>

          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {admin.id} • {admin.department}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{admin.designation}</span>
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60">
              {admin.status}
            </span>
          </div>

          {/* Contact Details Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{admin.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{admin.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{admin.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Quote Card */}
      {admin.quote && (
        <div className="w-full lg:w-auto lg:max-w-xs xl:max-w-sm rounded-2xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-100/70 dark:border-slate-700/60 p-4.5 flex items-start gap-3 self-stretch lg:self-center">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Quote className="w-4 h-4 fill-indigo-600 dark:fill-indigo-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              "{admin.quote.text}"
            </p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              — {admin.quote.author}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
