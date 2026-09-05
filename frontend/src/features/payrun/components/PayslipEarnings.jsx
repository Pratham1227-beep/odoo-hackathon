import React from 'react';
import { formatINR, calculateTotalEarnings } from '../data/payslipData';

export default function PayslipEarnings({ earnings = [] }) {
  const total = calculateTotalEarnings(earnings);

  return (
    <div className="bg-emerald-50/25 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">
          Earnings
        </h4>

        <table className="w-full text-xs">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-emerald-100 dark:border-emerald-900/30 pb-1.5">
              <th className="pb-2 text-left font-semibold">Component</th>
              <th className="pb-2 text-right font-semibold">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100/60 dark:divide-emerald-900/20">
            {earnings.map((item) => (
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
      <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
        <span>Total Earnings (A)</span>
        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
          {formatINR(total)}
        </span>
      </div>
    </div>
  );
}
