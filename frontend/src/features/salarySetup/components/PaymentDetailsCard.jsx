import React from 'react';
import {
  Landmark,
  CreditCard,
  Building2,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { paymentMethodsList, paymentCyclesList } from '../data/salarySetupData';

export default function PaymentDetailsCard({
  paymentDetails,
  onChangePaymentField,
}) {
  if (!paymentDetails) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Payment Details
      </h3>

      <div className="space-y-3.5">
        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Payment Method
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Landmark className="w-4 h-4" />
            </div>
            <select
              name="paymentMethod"
              value={paymentDetails.paymentMethod || 'Bank Transfer'}
              onChange={(e) => onChangePaymentField('paymentMethod', e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-2xs"
            >
              {paymentMethodsList.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Bank Account Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Bank Account Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="bankAccountNumber"
              value={paymentDetails.bankAccountNumber || ''}
              onChange={(e) => onChangePaymentField('bankAccountNumber', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
              placeholder="e.g. *********1234"
            />
          </div>
        </div>

        {/* IFSC Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            IFSC Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="ifscCode"
              value={paymentDetails.ifscCode || ''}
              onChange={(e) => onChangePaymentField('ifscCode', e.target.value.toUpperCase())}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-medium uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
              placeholder="e.g. HDFC0001234"
            />
          </div>
        </div>

        {/* Payment Cycle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Payment Cycle
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              name="paymentCycle"
              value={paymentDetails.paymentCycle || 'Monthly (1st of every month)'}
              onChange={(e) => onChangePaymentField('paymentCycle', e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-2xs"
            >
              {paymentCyclesList.map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
