import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ImportContractsModal({
  isOpen,
  onClose,
  onImportComplete,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const csvContent =
      'Employee ID,Employee Name,Department,Contract Type,Start Date,End Date,Salary,Notice Period,Reporting Manager\n' +
      'EMP013,Siddharth Rao,Engineering,Permanent,01 Oct 2026,-,95000,3 Months,Ayesha Siddiqui\n' +
      'EMP014,Meera Nambiar,Design,Fixed Term,01 Oct 2026,30 Sep 2028,78000,2 Months,Sneha Kapoor\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'WageWise_Contracts_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a valid CSV file.');
        return;
      }
      setError('');
      setSelectedFile(file);
    }
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload a CSV file before submitting.');
      return;
    }

    setIsImporting(true);

    setTimeout(() => {
      setIsImporting(false);
      onImportComplete([
        {
          id: 'CON013',
          employeeId: 'EMP013',
          employeeName: 'Siddharth Rao',
          designation: 'Senior Backend Engineer',
          department: 'Engineering',
          avatar: null,
          initials: 'SR',
          avatarBg: 'bg-emerald-100 text-emerald-700',
          contractType: 'Permanent',
          startDate: '01 Oct 2026',
          endDate: '-',
          status: 'Active',
          noticePeriod: '3 Months',
          workingHours: '9:00 AM – 5:00 PM',
          salary: 95000,
          salaryFormatted: '₹95,000 / month',
          reportingManager: 'Ayesha Siddiqui',
          document: {
            name: 'Siddharth_Contract.pdf',
            size: '2.1 MB',
            type: 'PDF Document',
            uploadedAt: 'Just now',
          },
          lastUpdated: 'Just now',
        },
      ]);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Import Contracts
              </h2>
              <p className="text-slate-400 text-[11px]">
                Batch upload employee contracts via CSV.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors">
            <input
              type="file"
              id="csv-file-input"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              {selectedFile ? (
                <div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedFile.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for processing
                  </div>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Choose CSV file
                  </span>{' '}
                  <span className="text-slate-400">or drop here</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supported format: Comma Separated Values (.csv)
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Sample CSV Download */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Need the template format?
            </span>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isImporting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {isImporting ? 'Importing...' : 'Import Contracts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
