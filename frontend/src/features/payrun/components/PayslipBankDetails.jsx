import React from 'react';
import { Landmark } from 'lucide-react';

export default function PayslipBankDetails({ bankDetails }) {
  if (!bankDetails) return null;

  return (
    <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
        <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span>Bank Details</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
            Bank Name
          </span>
          <span className="font-bold text-slate-900 dark:text-white mt-1 block">
            {bankDetails.bankName || 'HDFC Bank'}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
            Account Number
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">
            {bankDetails.accountNumber || '************1234'}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
            IFSC Code
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">
            {bankDetails.ifsc || 'HDFC0001234'}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
            Account Type
          </span>
          <span className="font-bold text-slate-900 dark:text-white mt-1 block">
            {bankDetails.accountType || 'Savings'}
          </span>
        </div>
      </div>
    </div>
  );
}
