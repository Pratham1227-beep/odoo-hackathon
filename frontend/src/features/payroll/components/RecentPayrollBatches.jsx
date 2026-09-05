import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Users,
} from 'lucide-react';
import { recentBatches } from '../data/payrollData';

export default function RecentPayrollBatches() {
  const [downloadedId, setDownloadedId] = useState(null);

  const handleDownloadSummary = (id) => {
    setDownloadedId(id);
    const batch = recentBatches.find((b) => b.id === id);
    const content = `Batch ID: ${batch.id}\nPeriod: ${batch.period}\nEmployees: ${batch.employeesCount}\nGross Payout: ${batch.grossPayout}\nNet Payout: ${batch.netPayout}\nStatus: ${batch.status}\nPay Date: ${batch.payDate}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${batch.id}_Summary.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Payroll Batches
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            History of generated, validated, and disbursed payroll cycles.
          </p>
        </div>

        <Link
          to="/payrun"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors self-start sm:self-auto"
        >
          <span>View All in Payrun Operations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="pb-3 pl-1">Batch / Cycle</th>
              <th className="pb-3">Structure</th>
              <th className="pb-3">Employees</th>
              <th className="pb-3">Gross / Net Payout</th>
              <th className="pb-3">Disbursement Date</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 pr-1 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentBatches.map((batch) => (
              <tr
                key={batch.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Batch / Period */}
                <td className="py-3.5 pl-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {batch.period}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {batch.id}
                  </div>
                </td>

                {/* Salary Structure */}
                <td className="py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                  {batch.structure}
                </td>

                {/* Headcount */}
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {batch.employeesCount}
                  </span>
                </td>

                {/* Payouts */}
                <td className="py-3.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Net: {batch.netPayout}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Gross: {batch.grossPayout}
                  </div>
                </td>

                {/* Date */}
                <td className="py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                  {batch.payDate}
                </td>

                {/* Status */}
                <td className="py-3.5">
                  {batch.statusType === 'amber' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {batch.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {batch.status}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 pr-1 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDownloadSummary(batch.id)}
                      title="Download batch summary report"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {downloadedId === batch.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    <Link
                      to={batch.actionLink}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold transition-colors"
                    >
                      <span>{batch.statusType === 'amber' ? 'Resume' : 'View'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
