import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, FileText } from 'lucide-react';

export default function CreateContractModal({
  isOpen,
  onClose,
  onCreateContract,
  prefilledTemplate = null,
  availableEmployees = [],
}) {
  const [employeeId, setEmployeeId] = useState('EMP001');
  const [contractType, setContractType] = useState('Permanent');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('3 Months');
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('05:00 PM');
  const [salary, setSalary] = useState(85000);
  const [reportingManager, setReportingManager] = useState('Rohan Mehta');
  const [notes, setNotes] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefilledTemplate) {
      setContractType(prefilledTemplate.contractType || 'Permanent');
      setNoticePeriod(prefilledTemplate.noticePeriod || '3 Months');
      setWorkingHoursStart(prefilledTemplate.workingHoursStart || '09:00 AM');
      setWorkingHoursEnd(prefilledTemplate.workingHoursEnd || '05:00 PM');
      if (prefilledTemplate.defaultSalary) {
        setSalary(prefilledTemplate.defaultSalary);
      }
    }
  }, [prefilledTemplate]);

  if (!isOpen) return null;

  const isPermanent = contractType === 'Permanent';

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: 'PDF Document',
        uploadedAt: 'Just now',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!employeeId) {
      setError('Please select an employee.');
      return;
    }
    if (!startDate) {
      setError('Start date is required.');
      return;
    }
    if (!isPermanent && !endDate) {
      setError('End date is required for non-permanent contracts.');
      return;
    }
    if (!isPermanent && endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    setError('');

    const targetEmp = availableEmployees.find((emp) => emp.employeeId === employeeId) || {
      employeeId,
      employeeName: 'New Employee',
      designation: 'Specialist',
      department: 'Engineering',
    };

    const formatDateStr = (d) => {
      if (!d) return '-';
      const parsed = new Date(d);
      return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const newContract = {
      id: `CON00${Date.now().toString().slice(-3)}`,
      employeeId: targetEmp.employeeId,
      employeeName: targetEmp.employeeName,
      designation: targetEmp.designation,
      department: targetEmp.department,
      avatar: targetEmp.avatar || null,
      initials: targetEmp.initials || targetEmp.employeeName.slice(0, 2).toUpperCase(),
      avatarBg: targetEmp.avatarBg || 'bg-indigo-100 text-indigo-700',
      contractType,
      startDate: formatDateStr(startDate),
      endDate: isPermanent ? '-' : formatDateStr(endDate),
      status: 'Active',
      noticePeriod,
      workingHours: `${workingHoursStart} – ${workingHoursEnd}`,
      salary: Number(salary) || 85000,
      salaryFormatted: `₹${(Number(salary) || 85000).toLocaleString()} / month`,
      reportingManager,
      document: documentFile || {
        name: `${targetEmp.employeeName.replace(/\s+/g, '_')}_Contract.pdf`,
        size: '2.1 MB',
        type: 'PDF Document',
        uploadedAt: 'Just now',
      },
      lastUpdated: 'Just now',
      notes,
      history: [
        {
          id: `H-${Date.now()}`,
          date: formatDateStr(startDate),
          title: 'Contract Created',
          subtitle: `${contractType} contract drafted and issued`,
          author: 'HR Admin',
        },
      ],
    };

    onCreateContract(newContract);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Create Employment Contract
            </h2>
            <p className="text-slate-400 mt-0.5">
              Draft contract terms, assign validity dates, and upload signed agreements.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Employee *
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {availableEmployees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName} ({emp.employeeId}) — {emp.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contract Type *
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Permanent">Permanent</option>
                <option value="Fixed Term">Fixed Term</option>
                <option value="Probation">Probation</option>
                <option value="Consultant">Consultant</option>
                <option value="Internship">Internship</option>
                <option value="Part Time">Part Time</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date {isPermanent ? '(Not Applicable)' : '*'}
              </label>
              <input
                type="date"
                disabled={isPermanent}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder={isPermanent ? 'Permanent (Indefinite)' : ''}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Compensation & Notice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agreed Gross Salary (₹/month)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notice Period
              </label>
              <select
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="3 Months">3 Months</option>
                <option value="2 Months">2 Months</option>
                <option value="1 Month">1 Month</option>
                <option value="2 Weeks">2 Weeks</option>
                <option value="Immediate">Immediate / None</option>
              </select>
            </div>
          </div>

          {/* Working Hours & Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Working Hours
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  placeholder="09:00 AM"
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  placeholder="05:00 PM"
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reporting Manager
              </label>
              <input
                type="text"
                value={reportingManager}
                onChange={(e) => setReportingManager(e.target.value)}
                placeholder="Manager Name"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Signed Contract Document (PDF, DOC, DOCX)
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                id="contract-file-input"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="contract-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                {documentFile ? (
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                    <FileText className="w-4 h-4" />
                    <span>{documentFile.name} ({documentFile.size})</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Upload Document
                    </span>{' '}
                    <span className="text-slate-400">or drag and drop</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      PDF, DOCX up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contract Notes / Special Clauses
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Eligible for annual performance bonus; health insurance coverage enrolled."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Create Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
