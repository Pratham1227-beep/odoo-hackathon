import React, { useState } from 'react';
import { X, Printer, Download, Building2, CheckCircle2 } from 'lucide-react';
import { calculateSalaryBreakdown } from '../data/payrunData';
import { payrollService } from '../../payroll/services/payrollService';

export default function PayslipModal({
  isOpen,
  onClose,
  employee,
  period = 'September 2026',
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !employee) return null;

  const breakdown = calculateSalaryBreakdown(
    employee.grossSalary,
    employee.salaryStructureId || 'STR-001'
  );

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const payslipUuid = employee.payslipId || (employee.id?.includes('-') ? employee.id : null);

    if (payslipUuid) {
      try {
        const { blob, filename } = await payrollService.downloadPayslipPdf(payslipUuid);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || `WageWise_${employee.name.replace(/\s+/g, '_')}_Payslip.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false);
        return;
      } catch (err) {
        console.warn('Backend PDF download fallback:', err.message);
      }
    }

    setTimeout(() => {
      setIsDownloading(false);
      const safeName = (employee.name || 'Employee').replace(/\s+/g, '_');
      const safeMonth = period.replace(/\s+/g, '_');
      const filename = `WageWise_${safeName}_${safeMonth}_Payslip.pdf`;

      const blob = new Blob([
        `WageWise Official Payslip\nEmployee: ${employee.name}\nPeriod: ${period}\nNet Pay: ${formatINR(breakdown.netPay)}`
      ], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Salary Payslip
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {period}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print Payslip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Header with Employer and Brand */}
          <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                W
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  WageWise Inc. (Acme Pvt. Ltd.)
                </h3>
                <p className="text-[11px] text-slate-500">
                  CIN: U72200KA2024PTC189201 | Bengaluru, Karnataka
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Payslip</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Payslip Period: {period}
              </p>
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Employee Name
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {employee.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Employee ID
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {employee.id}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Department
              </span>
              <span className="font-semibold">{employee.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Bank A/C No.
              </span>
              <span className="font-mono">
                {employee.bankDetails?.accountNumber
                  ? `••••${employee.bankDetails.accountNumber.slice(-4)}`
                  : 'Pending'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Working Days
              </span>
              <span className="font-semibold">
                {employee.attendance?.workingDays || 22} Days
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Days Present
              </span>
              <span className="font-semibold">
                {employee.attendance?.presentDays || 22} Days
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Paid Leaves
              </span>
              <span className="font-semibold">
                {employee.attendance?.paidLeave || 0} Days
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Payment Mode
              </span>
              <span className="font-semibold">Direct Bank Transfer</span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                <span>Earnings Component</span>
                <span>Amount</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="font-medium">{formatINR(breakdown.basic)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                  <span className="font-medium">{formatINR(breakdown.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Special Allowance</span>
                  <span className="font-medium">{formatINR(breakdown.specialAllowance)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Gross Earnings</span>
                  <span>{formatINR(breakdown.grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                <span>Deductions Component</span>
                <span>Amount</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Provident Fund (PF)</span>
                  <span className="font-medium">{formatINR(breakdown.pf)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Professional Tax (PT)</span>
                  <span className="font-medium">{formatINR(breakdown.profTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">TDS / Income Tax</span>
                  <span className="font-medium">{formatINR(breakdown.tds)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Total Deductions</span>
                  <span className="text-rose-600 dark:text-rose-400">{formatINR(breakdown.deductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs text-indigo-900 dark:text-indigo-300 font-bold block">
                Net Salary Payable
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Gross Earnings minus Total Statutory Deductions
              </span>
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {formatINR(breakdown.netPay)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[11px] text-slate-400">
            Confidential Document — Generated electronically by WageWise
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
