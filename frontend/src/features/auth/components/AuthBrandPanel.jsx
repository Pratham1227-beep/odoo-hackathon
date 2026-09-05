import React from 'react';
import { Users, Zap, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import ProductPreview from './ProductPreview';

export default function AuthBrandPanel({ currentStep = 1, orgName = '' }) {
  return (
    <div className="flex flex-col justify-between h-full py-2 px-2 sm:px-4 lg:px-6 space-y-8">
      {/* Top Marketing Copy */}
      <div className="space-y-4">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
          <span>
            {currentStep === 1
              ? 'Trusted by forward-thinking organizations'
              : 'Set up your admin account'}
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          {currentStep === 1 ? (
            <>
              Simpler Payroll. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
                Happier Teams.
              </span>
            </>
          ) : (
            <>
              Your Payroll, <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
                Your Control.
              </span>
            </>
          )}
        </h1>

        {/* Supporting description */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg font-normal leading-relaxed">
          {currentStep === 1
            ? 'Manage your employees, attendance, leave and payroll — all in one place.'
            : 'Create an admin account to set up your organization, invite your team and start using WageWise.'}
        </p>
      </div>

      {/* Interactive Product Mockup */}
      <div className="py-2">
        <ProductPreview currentStep={currentStep} orgName={orgName} />
      </div>

      {/* 3 Bottom Benefit Items */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {currentStep === 1 ? (
          <>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Organize
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  Manage your people with ease
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/60">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Automate
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  Accurate calculations, fewer errors
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Grow
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  Focus on what matters most
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Secure
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  Your data stays protected
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/60">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Easy Setup
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  Get started in minutes
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Complete Control
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  Manage your entire payroll process
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
