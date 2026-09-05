import React from 'react';
import { formatINR, calculateTotalDeductions } from '../data/payslipData';

export default function PayslipDeductions({ deductions = [] }) {
  const total = calculateTotalDeductions(deductions);

  return (
    <div className="bg-rose-50/25 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-3">
          Deductions
        </h4>

        <table className="w-full text-xs">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-rose-100 dark:border-rose-900/30 pb-1.5">
              <th className="pb-2 text-left font-semibold">Component</th>
              <th className="pb-2 text-right font-semibold">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100/60 dark:divide-rose-900/20">
            {deductions.map((item) => (
              <tr key={item.id} className="py-2">
                <td className="py-2 font-medium text-slate-700 dark:text-slate-200">
                  {item.name}
                </td>
                <td className="py-2 text-right font-semibold text-slate-900 dark:text-white">
                  {formatINR(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Banner */}
      <div className="mt-4 pt-3 border-t border-rose-200/80 dark:border-rose-800/60 flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
        <span>Total Deductions (B)</span>
        <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
          {formatINR(total)}
        </span>
      </div>
    </div>
  );
}
