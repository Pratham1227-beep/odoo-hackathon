import React, { useState } from 'react';
import { X, Send, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../data/payslipData';

export default function SendPayslipModal({
  isOpen,
  onClose,
  employee,
  month = 'September 2026',
  netPay = 66400,
  onConfirmSend,
}) {
  const [emailAddress, setEmailAddress] = useState(
    employee?.email || 'ayesha.siddiqui@acme.com'
  );
  const [isPasswordProtected, setIsPasswordProtected] = useState(true);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !employee) return null;

  const handleSend = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onConfirmSend(emailAddress);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Send Payslip via Email
              </h3>
              <p className="text-[11px] text-slate-400">
                Disburse digital payslip directly to employee
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSend}>
          <div className="p-6 space-y-4 text-xs">
            {/* Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {employee.name} ({employee.id})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payslip Period:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {month}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Payable:</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatINR(netPay)}
                </span>
              </div>
            </div>

            {/* Recipient Email */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Security Setting */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="protectPdf"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer mt-0.5"
              />
              <label htmlFor="protectPdf" className="text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                <strong className="text-slate-800 dark:text-slate-200 block">
                  Password-Protected PDF
                </strong>
                Document encrypted with employee's birth year + last 4 digits of PAN.
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/30 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send Payslip'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
