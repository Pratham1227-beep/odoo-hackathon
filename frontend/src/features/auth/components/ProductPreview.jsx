import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  Check,
  AlertTriangle,
  Building2
} from 'lucide-react';
import WageWiseLogo from '../../../shared/components/WageWiseLogo';

export default function ProductPreview({ currentStep = 1, orgName = '' }) {
  const displayOrgName = orgName.trim() || 'Acme Pvt. Ltd.';

  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none">
      {/* Glow background effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-60 dark:opacity-40 pointer-events-none" />

      {/* Dashboard Mockup Card */}
      <div className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Mockup Top Browser/Window Bar */}
        <div className="bg-slate-100/90 dark:bg-slate-950 px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-14 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            </div>
          </div>
        </div>

        {/* Mockup Body */}
        <div className="flex flex-row min-h-[300px]">
          
          {/* Mini Sidebar */}
          <div className="w-36 sm:w-40 bg-slate-900 text-slate-300 p-3 flex flex-col justify-between shrink-0 border-r border-slate-800">
            <div className="space-y-3">
              {/* Mini Brand header */}
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
                <WageWiseLogo iconOnly showTagline={false} className="scale-75 origin-left" />
              </div>

              {/* Navigation Items */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-indigo-600 text-white font-medium shadow-xs">
                  <LayoutDashboard className="w-3 h-3 shrink-0" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-slate-400 hover:text-slate-200 transition-colors">
                  <Users className="w-3 h-3 shrink-0" />
                  <span>Employees</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-slate-400 hover:text-slate-200 transition-colors">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Attendance</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-slate-400 hover:text-slate-200 transition-colors">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>Time Off</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-slate-400 hover:text-slate-200 transition-colors">
                  <CreditCard className="w-3 h-3 shrink-0" />
                  <span>Payroll</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-slate-400 hover:text-slate-200 transition-colors">
                  <BarChart3 className="w-3 h-3 shrink-0" />
                  <span>Reports</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-slate-400 hover:text-slate-200 transition-colors">
                  <Settings className="w-3 h-3 shrink-0" />
                  <span>Settings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content Area */}
          <div className="flex-1 bg-slate-50/70 dark:bg-slate-950/60 p-3 sm:p-4 flex flex-col justify-between space-y-3">
            
            {/* Header / Greeting */}
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-sans">
                {currentStep === 1 ? 'Good to see you!' : 'Welcome, Admin!'}
              </h4>
              {currentStep >= 2 && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700 max-w-[140px] truncate">
                  <Building2 className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{displayOrgName}</span>
                </div>
              )}
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  <span className="truncate">Total Employees</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                  118
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="truncate">On Leave</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  8
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span className="truncate">Payroll Cost</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                  ₹14.24L
                </div>
              </div>
            </div>

            {/* Step 1 View: Payroll Readiness */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                  Payroll Readiness
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Circular Donut Ring 96% */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-teal-500 dark:text-teal-400"
                        strokeDasharray="96, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] sm:text-xs font-extrabold text-slate-900 dark:text-white">
                      96%
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-1 text-[10px] font-medium text-slate-700 dark:text-slate-300 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500 stroke-[3] shrink-0" />
                      <span>Contracts verified</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500 stroke-[3] shrink-0" />
                      <span>Attendance complete</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500 stroke-[3] shrink-0" />
                      <span>Salary rules applied</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>3 issues to review</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 & Step 3 View: Organization Setup */}
            {currentStep >= 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                  Organization Setup
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Circular Progress Ring */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-teal-500 dark:text-teal-400"
                        strokeDasharray={currentStep === 2 ? '60, 100' : '100, 100'}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] sm:text-xs font-extrabold text-slate-900 dark:text-white">
                      {currentStep === 2 ? '3/5' : '5/5'}
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-1 text-[10px] font-medium text-slate-700 dark:text-slate-300 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-500 stroke-[3] shrink-0" />
                      <span>Organization details</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-500 stroke-[3] shrink-0" />
                      <span>Admin account</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {currentStep === 3 ? (
                        <Check className="w-3 h-3 text-teal-500 stroke-[3] shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                      )}
                      <span className={currentStep === 2 ? 'text-slate-400 dark:text-slate-500' : ''}>
                        Invite team members
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {currentStep === 3 ? (
                        <Check className="w-3 h-3 text-teal-500 stroke-[3] shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                      )}
                      <span className={currentStep === 2 ? 'text-slate-400 dark:text-slate-500' : ''}>
                        Configure payroll settings
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {currentStep === 3 ? (
                        <Check className="w-3 h-3 text-teal-500 stroke-[3] shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                      )}
                      <span className={currentStep === 2 ? 'text-slate-400 dark:text-slate-500' : ''}>
                        Start processing payroll
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Handwritten-style Annotation at Bottom Right */}
      <div className="mt-3 flex items-start justify-end gap-1.5 pr-2 pointer-events-none select-none">
        <svg
          className="w-8 h-8 text-indigo-600 dark:text-indigo-400 stroke-current fill-none transform -rotate-12 shrink-0"
          viewBox="0 0 50 50"
        >
          <path
            d="M10,40 Q30,45 40,20 Q42,15 35,10 M40,20 L30,22 M40,20 L38,30"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-serif italic font-semibold text-indigo-800 dark:text-indigo-300 text-xs tracking-wide transform rotate-1 pt-1.5">
          {currentStep === 1
            ? 'Turn data into confident payroll'
            : 'Set up once. Run payroll with confidence.'}
        </span>
      </div>
    </div>
  );
}
