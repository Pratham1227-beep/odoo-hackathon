import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  Send,
  Calendar,
  ChevronDown,
  ChevronRight,
  Check,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import PayslipEmployeeHeader from '../components/PayslipEmployeeHeader';
import PayslipDocument from '../components/PayslipDocument';
import PayslipQuickActions from '../components/PayslipQuickActions';
import PayslipDetails from '../components/PayslipDetails';
import PayslipHistory from '../components/PayslipHistory';
import SendPayslipModal from '../components/SendPayslipModal';

import { payrunService } from '../services/payrunService';
import { employeeService } from '../../employees/services/employeeService';
import {
  getEmployeePayslip,
  payslipMonths,
  calculateNetPay,
} from '../data/payslipData';

export default function PayslipViewPage() {
  const { employeeId = 'me' } = useParams();

  // State
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [livePayslip, setLivePayslip] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const printRef = useRef(null);
  const dropdownRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchLivePayslip = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await payrunService.listPayslips({ page: 1, page_size: 10 });
      if (res?.items && res.items.length > 0) {
        const item = res.items[0];
        setLivePayslip(item);
      }
    } catch (err) {
      console.error('Failed to load payslip:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLivePayslip();
  }, [fetchLivePayslip]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMonthDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch / Compute current payslip data
  const payslip = useMemo(() => {
    if (livePayslip) {
      const gross = Number(livePayslip.gross_salary || 85000);
      const deductions = Number(livePayslip.total_deductions || 9000);
      const basic = Number(livePayslip.basic_salary || gross * 0.5);
      const hra = Math.round(basic * 0.5);
      const special = Math.max(0, gross - basic - hra);
      const pf = Math.round(basic * 0.12);
      const pt = 200;
      const tds = Math.max(0, deductions - pf - pt);

      return {
        id: livePayslip.payslip_number || livePayslip.id,
        period: livePayslip.payrun_name || selectedMonth,
        payDate: livePayslip.paid_at ? new Date(livePayslip.paid_at).toLocaleDateString('en-GB') : '30 Sep 2026',
        status: livePayslip.status === 'PAID' ? 'Paid' : 'Generated',
        employee: {
          id: livePayslip.employee_code || 'EMP001',
          name: livePayslip.employee_name || 'Employee',
          department: 'Technology',
          designation: 'Staff',
          email: 'employee@amaal.neargrab.in',
          bankAccount: '••••••••4892',
          panNumber: 'ABCDE1234F',
          uanNumber: '100904812345',
          joiningDate: '15 Jan 2024',
          totalWorkingDays: 22,
          daysWorked: 22,
          leavesTaken: 0,
        },
        earnings: [
          { name: 'Basic Salary', type: 'Fixed', amount: basic },
          { name: 'House Rent Allowance (HRA)', type: 'Fixed', amount: hra },
          { name: 'Special Allowance', type: 'Fixed', amount: special },
        ],
        deductions: [
          { name: 'Provident Fund (PF)', type: 'Statutory', amount: pf },
          { name: 'Professional Tax (PT)', type: 'Statutory', amount: pt },
          { name: 'Income Tax (TDS)', type: 'Statutory', amount: tds },
        ],
        details: {
          paymentMethod: 'Direct Bank Transfer',
          bankName: 'HDFC Bank Ltd.',
          accountNumber: '••••••••4892',
          transactionId: `TXN${Date.now().toString().slice(-8)}`,
          paymentDate: '30 Sep 2026',
          grossEarnings: gross,
          totalDeductions: deductions,
        },
        history: [
          { date: 'Just now', action: 'Payslip generated', author: 'System' },
        ],
      };
    }
    return getEmployeePayslip(employeeId, selectedMonth);
  }, [livePayslip, employeeId, selectedMonth]);

  const netPay = useMemo(() => {
    return calculateNetPay(payslip.earnings, payslip.deductions);
  }, [payslip]);

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    showToast('Preparing PDF payslip document...');
    setTimeout(() => {
      setIsDownloading(false);
      const safeName = (payslip.employee?.name || 'Employee').replace(/\s+/g, '_');
      const safeMonth = selectedMonth.replace(/\s+/g, '_');
      const filename = `WageWise_${safeName}_${safeMonth}_Payslip.pdf`;

      // Trigger dummy download file
      const blob = new Blob([
        `WageWise Official Payslip\nEmployee: ${payslip.employee?.name}\nPeriod: ${selectedMonth}\nNet Pay: ₹${netPay.toLocaleString('en-IN')}`
      ], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Payslip downloaded successfully: ${filename}`);
    }, 900);
  };

  const handleConfirmSendEmail = (email) => {
    showToast(`✓ Payslip sent successfully to ${email}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800'
              : 'bg-slate-900 text-white border-slate-700 dark:bg-slate-100 dark:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage.message}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 p-0.5 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link
          to="/payroll"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Payroll
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          to="/payrun"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Payslips
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900 dark:text-white">
          View Payslip
        </span>
      </nav>

      {/* 2. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Payslip View
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View detailed salary breakdown for the selected month.
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Month Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsMonthDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {isMonthDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Available Payslips
                </div>
                {payslipMonths.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMonth(m.label);
                      setIsMonthDropdownOpen(false);
                      showToast(`Loaded payslip for ${m.label}`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition-colors ${
                      selectedMonth === m.label
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{m.label}</span>
                    {selectedMonth === m.label && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {/* Send Payslip CTA Button */}
          <button
            type="button"
            onClick={() => setIsSendModalOpen(true)}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Payslip</span>
          </button>
        </div>
      </div>

      {/* 3. Employee Summary Header Card */}
      <PayslipEmployeeHeader employee={payslip.employee} />

      {/* 4. Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column (span 8 on XL): The Payslip Document */}
        <div className="xl:col-span-8">
          <PayslipDocument payslip={payslip} printRef={printRef} />
        </div>

        {/* Right Column (span 4 on XL): Quick Actions, Details, History */}
        <div className="xl:col-span-4 space-y-6">
          <PayslipQuickActions
            onDownloadPDF={handleDownloadPDF}
            onSendEmail={() => setIsSendModalOpen(true)}
            onPrint={handlePrint}
            isDownloading={isDownloading}
          />

          <PayslipDetails details={payslip.details} netPay={netPay} />

          <PayslipHistory history={payslip.history} />
        </div>
      </div>

      {/* Send Payslip Modal */}
      <SendPayslipModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        employee={payslip.employee}
        month={selectedMonth}
        netPay={netPay}
        onConfirmSend={handleConfirmSendEmail}
      />
    </div>
  );
}
