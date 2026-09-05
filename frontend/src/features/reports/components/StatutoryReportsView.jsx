import React from 'react';
import { statutoryReportsList } from '../data/reportsData';
import { ShieldCheck, Download, FileCheck, CheckCircle2 } from 'lucide-react';

export default function StatutoryReportsView({ onDownloadChallan }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Statutory Compliance & Return Filing Status</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Electronic Challan-cum-Returns (ECR), ESIC remittances, Form 24Q TDS summaries
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audit-Ready for September 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statutoryReportsList.map((stat) => (
            <div
              key={stat.id}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {stat.name}
                  </h4>
                  <span
                    className={`text-2xs font-semibold px-2 py-0.5 rounded-md ${
                      stat.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                    }`}
                  >
                    {stat.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2">
                  <div>
                    <span className="text-slate-400 text-2xs block">Employees Covered</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{stat.employeesCovered}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-2xs block">Due Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{stat.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-2xs block">Employee Share</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{stat.employeeContribution}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-2xs block">Employer Share</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{stat.employerContribution}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-2xs text-slate-400 block">Total Remittance</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.totalDeposit}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadChallan(stat.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ECR / Challan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
