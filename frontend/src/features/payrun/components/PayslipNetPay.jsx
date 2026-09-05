import React from 'react';
import { Wallet } from 'lucide-react';
import { formatINR } from '../data/payslipData';

export default function PayslipNetPay({ netPay = 0 }) {
  return (
    <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left Icon + Text */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-600/30 shrink-0">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Net Pay (A - B)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Amount credited to your bank account
          </p>
        </div>
      </div>

      {/* Right Big Amount */}
      <div>
        <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
          {formatINR(netPay)}
        </span>
      </div>
    </div>
  );
}
