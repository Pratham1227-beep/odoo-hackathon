import React from 'react';
import { Check, Mail, ArrowRight, Sparkles } from 'lucide-react';
import SignupProgress from './SignupProgress';

export default function SignupSuccess({
  formData,
  onGoToLogin,
  onStepClick
}) {
  const email = formData.adminEmail || formData.workEmail || 'admin@acme.com';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-all duration-200 text-center">
      {/* Form Header */}
      <div className="space-y-1 text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create Admin Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
          Set up your admin account and take control of your organization.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="my-6">
        <SignupProgress currentStep={3} onStepClick={onStepClick} />
      </div>

      {/* Success Content */}
      <div className="pt-4 pb-2 flex flex-col items-center space-y-5">
        {/* Large Success Illustration */}
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Rings */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-teal-400/20 rounded-full blur-xl animate-pulse" />
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-500 p-1 shadow-xl shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-inner">
                <Check className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3]" />
              </div>
            </div>
          </div>

          <div className="absolute -top-1 -right-1 text-amber-400">
            <Sparkles className="w-6 h-6 animate-bounce" />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            All Set, Admin!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Your admin account has been created successfully. You can now log in and start using WageWise.
          </p>
        </div>

        {/* Confirmation Email Card */}
        <div className="w-full p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-indigo-500/20">
              <Mail className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirmation email sent to:
              </span>
              <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300 break-all bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/80 inline-block w-full">
                {email}
              </div>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 pl-12 leading-relaxed">
            Please check your inbox (and spam folder) to verify your email address and activate full account privileges.
          </p>
        </div>

        {/* Action Button: Go to Login */}
        <div className="w-full pt-2">
          <button
            type="button"
            onClick={onGoToLogin}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Go to Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
