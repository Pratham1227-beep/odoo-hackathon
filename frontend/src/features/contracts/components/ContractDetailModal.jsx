import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  Clock,
  Briefcase,
  User,
  RotateCw,
  Ban,
  Download,
  Edit,
  History,
  ShieldCheck,
} from 'lucide-react';

export default function ContractDetailModal({
  isOpen,
  onClose,
  contract,
  onEdit,
  onRenew,
  onTerminate,
  onOpenDocument,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'history', 'documents'

  if (!isOpen || !contract) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Active
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Expiring Soon
          </span>
        );
      case 'Expired':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Expired
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-xs">
        {/* Header with Employee Info */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            {contract.avatar ? (
              <img
                src={contract.avatar}
                alt={contract.employeeName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-200 dark:ring-indigo-800"
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm ${
                  contract.avatarBg || 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {contract.initials || 'EM'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {contract.employeeName}
                </h2>
                {getStatusBadge(contract.status)}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                {contract.employeeId} • {contract.designation} • {contract.department}
              </p>
              <p className="text-[11px] text-slate-400">
                Contract Reference: {contract.id}
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

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-100 dark:border-slate-800">
          {[
            { id: 'overview', label: 'Contract Overview' },
            { id: 'documents', label: 'Documents & Files' },
            { id: 'history', label: 'Contract History' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-xs font-semibold relative transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Terms Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-medium">Contract Type</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {contract.contractType}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Remuneration</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {contract.salaryFormatted}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Start Date</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {contract.startDate}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">End Date</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {contract.endDate}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Notice Period</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {contract.noticePeriod || '3 Months'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Working Hours</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {contract.workingHours}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Reporting Manager</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {contract.reportingManager || 'Rohan Mehta'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Last Audited</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {contract.lastUpdated}
                  </div>
                </div>
              </div>

              {/* Document Reference Banner */}
              <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {contract.document?.name || 'Employment_Contract.pdf'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {contract.document?.size || '2.4 MB'} • Digitally Signed & Encrypted
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDocument(contract)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  View Document
                </button>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {contract.document?.name || 'Employment_Contract.pdf'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Uploaded on {contract.document?.uploadedAt || contract.startDate} • {contract.document?.size || '2.4 MB'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDocument(contract)}
                    className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDocument(contract)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
              {(contract.history && contract.history.length > 0
                ? contract.history
                : [
                    {
                      id: 'H01',
                      date: contract.startDate,
                      title: 'Contract Created',
                      subtitle: `${contract.contractType} contract initialized & executed`,
                      author: 'HR Operations',
                    },
                  ]
              ).map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {event.date}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                    {event.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {event.subtitle}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Logged by {event.author}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRenew(contract);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
              <span>Renew</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onTerminate(contract);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-semibold transition-colors cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5 text-rose-500" />
              <span>Terminate</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(contract);
              }}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Contract</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
