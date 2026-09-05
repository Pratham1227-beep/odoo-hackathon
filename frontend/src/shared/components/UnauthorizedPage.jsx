import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage({ isDarkMode }) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          You don't have the required permissions to view this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <Link 
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
