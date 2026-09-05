import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Check,
  AlertTriangle,
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  CreditCard,
  BarChart3,
  Settings
} from 'lucide-react';
import WageWiseLogo from '../../../shared/components/WageWiseLogo';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6 text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800">
              <span className="w-4 h-4 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">⚙</span>
              <span>Payroll made simple. Decisions made smarter.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Know Before <br />
              <span className="text-indigo-600 dark:text-indigo-400">
                You Pay.
              </span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed">
              WageWise connects your people, contracts, attendance and salary rules — so you can calculate, validate and pay with confidence.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md active:scale-[0.98] transition-all"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#watch-demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                Watch Demo
              </a>
            </div>

            {/* 3 Benefit Checklist Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Accurate Payroll</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Fewer Errors</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Happier Teams</span>
              </div>
            </div>
          </div>

          {/* Right Hero Product Mockup */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0">
            
            {/* Dashboard Container Box */}
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
              
              {/* Mockup Top Browser Window Controls */}
              <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  </div>
                </div>
              </div>

              {/* Mockup Body (Sidebar + Content) */}
              <div className="flex flex-col sm:flex-row min-h-[340px]">
                
                {/* Sidebar */}
                <div className="w-full sm:w-44 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between shrink-0 border-r border-slate-800">
                  <div className="space-y-4">
                    {/* Mini Brand header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <WageWiseLogo iconOnly showTagline={false} />
                    </div>

                    {/* Nav Items */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-medium shadow-xs">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                        <Users className="w-3.5 h-3.5" />
                        <span>Employees</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Attendance</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Time Off</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Payroll</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Reports</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Card Area */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-center">
                  
                  {/* Payroll Readiness Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                      Payroll Readiness
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      
                      {/* Donut Progress Ring */}
                      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-200 dark:text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-indigo-600 dark:text-indigo-400"
                            strokeDasharray="96, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-xl font-extrabold text-slate-900 dark:text-white">
                          96%
                        </span>
                      </div>

                      {/* Verification Status Items */}
                      <div className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                          <span>118 employees verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                          <span>Attendance records complete</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                          <span>Salary rules applied</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>3 issues to review</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="flex justify-end pt-2">
                      <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs">
                        Review Issues
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Handwritten-style Annotation at Bottom Right */}
            <div className="absolute -bottom-14 right-2 sm:right-8 flex items-start gap-2 pointer-events-none select-none">
              <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400 stroke-current fill-none transform -rotate-12" viewBox="0 0 50 50">
                <path d="M10,40 Q30,45 40,20 Q42,15 35,10 M40,20 L30,22 M40,20 L38,30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-serif italic font-bold text-indigo-900 dark:text-indigo-300 text-sm tracking-wide transform rotate-2 pt-3">
                Turn data into confident payroll
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
