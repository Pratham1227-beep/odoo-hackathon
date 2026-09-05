import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, Check } from 'lucide-react';

export default function ExportReportModal({ isOpen, onClose, onExport }) {
  const [format, setFormat] = useState('pdf');
  const [sections, setSections] = useState({
    payroll: true,
    attendance: true,
    workforce: true,
    statutory: true,
  });

  if (!isOpen) return null;

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = () => {
    onExport(format, sections);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Download className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Export Executive Reports
              </h3>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                Generate formatted reports for board review and compliance audits
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  format === 'pdf'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-5 h-5 mb-1" />
                <span>PDF Report</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  format === 'excel'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 mb-1 text-emerald-600" />
                <span>Excel (XLSX)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  format === 'csv'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 mb-1 text-blue-600" />
                <span>Raw CSV</span>
              </button>
            </div>
          </div>

          {/* Included sections */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Sections to Include
            </label>
            <div className="space-y-2">
              {[
                { id: 'payroll', label: 'Payroll Costs & Department Breakdown' },
                { id: 'attendance', label: 'Attendance, Absenteeism & Overtime' },
                { id: 'workforce', label: 'Workforce Demographics & Tenure' },
                { id: 'statutory', label: 'Statutory Remittances (PF, ESI, TDS)' },
              ].map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => toggleSection(sec.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    {sec.label}
                  </span>
                  <div
                    className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center ${
                      sections[sec.id]
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {sections[sec.id] && <Check className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate & Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
