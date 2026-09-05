import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function PayrunBreadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
      <Link
        to="/payroll"
        className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Payroll</span>
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      <Link
        to="/payrun"
        className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        Payrun
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      <span className="font-bold text-slate-900 dark:text-white">
        Processing
      </span>
    </nav>
  );
}
