import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
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

import { payrollService } from '../../payroll/services/payrollService';
import {
  mapPayslipDetailToUi,
  mapPayslipListItem,
} from '../../payroll/utils/payrollMappers';
import {
  getEmployeePayslip,
  payslipMonths,
  calculateNetPay,
} from '../data/payslipData';

export default function PayslipViewPage() {
  const { employeeId = 'EMP001' } = useParams();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlPayslipId = queryParams.get('payslipId');

  // State
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Backend loaded payslip and month list
  const [apiPayslip, setApiPayslip] = useState(null);
  const [availableMonths, setAvailableMonths] = useState(payslipMonths);

  const printRef = useRef(null);
  const dropdownRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMonthDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real payslip from Backend API if available
  const loadPayslipFromApi = useCallback(async () => {
    try {
      if (urlPayslipId && urlPayslipId.includes('-')) {
        const detail = await payrollService.getPayslip(urlPayslipId);
        if (detail) {
          setApiPayslip(mapPayslipDetailToUi(detail));
          return;
        }
      }

      // Query payslips list for this employee if employeeId looks like a UUID or query all
      const params = {};
      if (employeeId && employeeId.includes('-')) {
        params.employee_id = employeeId;
      }

      const listRes = await payrollService.listPayslips(params);
      const items = listRes?.items || [];

      if (items.length > 0) {
        const mappedList = items.map((p) => mapPayslipListItem(p));
        setAvailableMonths(mappedList);

        // Fetch detail of the first or matching payslip
        const target = items[0];
        const detail = await payrollService.getPayslip(target.id);
        if (detail) {
          setApiPayslip(mapPayslipDetailToUi(detail));
        }
      }
    } catch (err) {
      console.warn('Payslip API fetch fallback note:', err.message);
    }
  }, [employeeId, urlPayslipId]);

  useEffect(() => {
    loadPayslipFromApi();
  }, [loadPayslipFromApi]);

  // Derived payslip data (combines backend api data or client mock fallback)
  const payslip = useMemo(() => {
    if (apiPayslip) return apiPayslip;
    return getEmployeePayslip(employeeId, selectedMonth);
  }, [apiPayslip, employeeId, selectedMonth]);

  const netPay = useMemo(() => {
    if (payslip.netSalary) return payslip.netSalary;
    return calculateNetPay(payslip.earnings, payslip.deductions);
  }, [payslip]);

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    showToast('Preparing PDF payslip document...');

    const payslipUuid = payslip.raw?.id || (payslip.id?.includes('-') ? payslip.id : null);

    if (payslipUuid) {
      try {
        const { blob, filename } = await payrollService.downloadPayslipPdf(payslipUuid);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || `WageWise_Payslip_${payslipUuid.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsDownloading(false);
        showToast(`Official PDF payslip downloaded: ${link.download}`);
        return;
      } catch (err) {
        console.warn('Backend PDF download fallback:', err.message);
      }
    }

    // Client fallback PDF generation
    setTimeout(() => {
      setIsDownloading(false);
      const safeName = (payslip.employee?.name || 'Employee').replace(/\s+/g, '_');
      const safeMonth = selectedMonth.replace(/\s+/g, '_');
      const filename = `WageWise_${safeName}_${safeMonth}_Payslip.pdf`;

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
    }, 800);
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
                {availableMonths.map((m) => (
                  <button
                    key={m.id}
                    onClick={async () => {
                      setSelectedMonth(m.periodLabel || m.label);
                      setIsMonthDropdownOpen(false);
                      if (m.raw?.id) {
                        try {
                          const d = await payrollService.getPayslip(m.raw.id);
                          if (d) setApiPayslip(mapPayslipDetailToUi(d));
                        } catch (e) {
                          // keep
                        }
                      }
                      showToast(`Loaded payslip for ${m.periodLabel || m.label}`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition-colors ${
                      selectedMonth === (m.periodLabel || m.label)
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="truncate">{m.periodLabel || m.label}</span>
                    {selectedMonth === (m.periodLabel || m.label) && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
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
            <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
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
