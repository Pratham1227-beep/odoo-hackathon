import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

export default function ContractDocumentViewer({
  isOpen,
  onClose,
  contract,
}) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !contract) return null;

  const handleDownload = () => {
    setDownloadSuccess(true);
    const content = `WAGEWISE EMPLOYMENT CONTRACT\nEmployee: ${contract.employeeName}\nID: ${contract.employeeId}\nDesignation: ${contract.designation}\nDepartment: ${contract.department}\nContract Type: ${contract.contractType}\nStart Date: ${contract.startDate}\nEnd Date: ${contract.endDate}\nSalary: ${contract.salaryFormatted}\nWorking Hours: ${contract.workingHours}\nNotice Period: ${contract.noticePeriod}\nReporting Manager: ${contract.reportingManager}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', contract.document?.name || 'Employment_Contract.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-xs">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {contract.document?.name || 'Employment_Contract.pdf'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Official Digitally Signed Document • Verified by WageWise Compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Simulated Printable Document Paper) */}
        <div className="p-8 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex justify-center">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 max-w-2xl w-full space-y-6 leading-relaxed">
            {/* Document Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h1 className="text-lg font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                  WageWise
                </h1>
                <p className="text-[10px] text-slate-400">
                  Acme Technologies Private Limited
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" /> Digitally Certified
                </span>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  REF: {contract.id}-{contract.employeeId}
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-2">
              <h2 className="text-base font-extrabold uppercase tracking-wide">
                Employment Agreement
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Classification: {contract.contractType} Contract
              </p>
            </div>

            {/* Agreement Terms Clauses */}
            <div className="space-y-4 text-xs">
              <p>
                This Employment Agreement is made and entered into as of{' '}
                <span className="font-bold underline">{contract.startDate}</span>, by and between{' '}
                <span className="font-bold">Acme Technologies Private Limited</span> (the "Company")
                and <span className="font-bold underline">{contract.employeeName}</span>{' '}
                (Employee ID: <span className="font-mono">{contract.employeeId}</span>).
              </p>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  1. Position & Scope of Work
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  The Employee shall be engaged in the position of{' '}
                  <span className="font-semibold">{contract.designation}</span> within the{' '}
                  <span className="font-semibold">{contract.department}</span> department, reporting
                  directly to {contract.reportingManager}.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  2. Remuneration & Working Schedule
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Agreed Salary:</span>{' '}
                    <span className="font-bold">{contract.salaryFormatted}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Contract Term:</span>{' '}
                    <span className="font-bold">
                      {contract.startDate} to {contract.endDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Working Hours:</span>{' '}
                    <span className="font-bold">{contract.workingHours}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Notice Period:</span>{' '}
                    <span className="font-bold">{contract.noticePeriod}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  3. Confidentiality & Code of Conduct
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  The Employee agrees to hold all proprietary trade secrets, customer data, and system
                  codebases in strict confidence in accordance with organizational cybersecurity policies.
                </p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-[11px]">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  For Acme Technologies Pvt. Ltd.
                </p>
                <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mt-2" />
                <p className="text-slate-400 mt-1">Authorized Human Resources Officer</p>
              </div>

              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Employee Acceptance
                </p>
                <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mt-2 flex items-end">
                  <span className="font-serif italic font-bold text-indigo-600 dark:text-indigo-400">
                    {contract.employeeName}
                  </span>
                </div>
                <p className="text-slate-400 mt-1">Signed on {contract.startDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
