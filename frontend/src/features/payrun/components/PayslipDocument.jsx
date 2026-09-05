import React from 'react';
import WageWiseLogo from '../../../shared/components/WageWiseLogo';
import PayslipEarnings from './PayslipEarnings';
import PayslipDeductions from './PayslipDeductions';
import PayslipNetPay from './PayslipNetPay';
import PayslipBankDetails from './PayslipBankDetails';
import { calculateNetPay } from '../data/payslipData';

export default function PayslipDocument({ payslip, printRef }) {
  if (!payslip) return null;

  const netPay = calculateNetPay(payslip.earnings, payslip.deductions);

  return (
    <div
      ref={printRef}
      id="printable-payslip-doc"
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 print:bg-white print:text-black"
    >
      {/* 1. Company Branding Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        {/* Left: WageWise Logo */}
        <div>
          <WageWiseLogo showTagline={true} />
        </div>

        {/* Right: Company details */}
        <div className="text-left sm:text-right">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {payslip.company?.name || 'Acme Pvt. Ltd.'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-0.5 leading-relaxed">
            {payslip.company?.address || '123 Business Park, MG Road, Bengaluru - 560001, India'}
          </p>
        </div>
      </div>

      {/* 2. Title & Pay Period / Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          Payslip for {payslip.period?.month || 'September 2026'}
        </h3>
        <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
          <div>
            Pay Period:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {payslip.period?.payPeriod || '01 Sep 2026 - 30 Sep 2026'}
            </strong>
          </div>
          <div className="mt-0.5">
            Pay Date:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {payslip.period?.payDate || '30 Sep 2026'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Earnings & Deductions Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PayslipEarnings earnings={payslip.earnings} />
        <PayslipDeductions deductions={payslip.deductions} />
      </div>

      {/* 4. Net Pay Card */}
      <PayslipNetPay netPay={netPay} />

      {/* 5. Bank Details Card */}
      <PayslipBankDetails bankDetails={payslip.bankDetails} />

      {/* 6. Footer Disclaimer & Signature note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500">
        <p>
          This is a computer-generated payslip and does not require a signature.
        </p>
        <p className="font-serif italic text-slate-500 dark:text-slate-400 text-xs">
          Thank you for your contribution!
        </p>
      </div>
    </div>
  );
}
