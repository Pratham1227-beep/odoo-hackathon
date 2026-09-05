import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import WageWiseLogo from '../../../shared/components/WageWiseLogo';
import LoginBrandPanel from '../components/LoginBrandPanel';
import LoginForm from '../components/LoginForm';

export default function LoginPage({ isDarkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  const handleLoginSubmit = (credentials) => {
    console.log('Login submitted:', credentials);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 relative overflow-hidden flex flex-col justify-between">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-purple-500/10 dark:bg-purple-900/15 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-900/10 rounded-full blur-3xl pointer-events-none translate-x-1/3" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-900/15 rounded-full blur-3xl pointer-events-none translate-y-1/3" />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg transition-transform hover:opacity-95"
        >
          <WageWiseLogo />
        </Link>

        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* New to WageWise? Create an account */}
          <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span className="hidden sm:inline">New to WageWise?</span>
            <Link
              to="/signup"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              <span>Create an account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Marketing & Benefits Panel (Hidden on small mobile, visible from lg) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5">
            <LoginBrandPanel />
          </div>

          {/* Right Column: Authentication Card */}
          <div className="w-full lg:col-span-7 xl:col-span-7 max-w-xl mx-auto lg:max-w-none flex justify-center lg:justify-end">
            <LoginForm onSubmit={handleLoginSubmit} />
          </div>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        © 2026 WageWise Inc. All rights reserved.
      </footer>
    </div>
  );
}
