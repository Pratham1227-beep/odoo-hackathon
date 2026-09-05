import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function LandingCTA() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-indigo-50 dark:bg-slate-900 p-8 sm:p-12 md:p-14 border border-indigo-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Text */}
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready to simplify your payroll?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal">
              Join forward-thinking organizations using WageWise.
            </p>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md active:scale-[0.98] transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

