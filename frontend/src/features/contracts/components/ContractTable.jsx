import React from 'react';
import { Download, RotateCw, Trash2, CheckSquare } from 'lucide-react';
import ContractRowActions from './ContractRowActions';

export default function ContractTable({
  contracts,
  selectedContract,
  onSelectContract,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onViewContract,
  onEditContract,
  onDownloadContract,
  onRenewContract,
  onTerminateContract,
  onDeleteContract,
  onBulkDelete,
  onBulkRenew,
  onBulkDownload,
}) {
  const isAllSelected =
    contracts.length > 0 && selectedIds.length === contracts.length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Active
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Expiring Soon
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/90 dark:bg-indigo-950/60 px-5 py-2.5 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold">
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{selectedIds.length} contracts selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBulkDownload}
              className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onBulkRenew}
              className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Renew</span>
            </button>

            <button
              type="button"
              onClick={onBulkDelete}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Contracts Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {/* Checkbox */}
              <th className="py-3.5 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  aria-label="Select all contracts"
                />
              </th>

              <th className="py-3.5 px-3">Employee</th>
              <th className="py-3.5 px-3">Employee ID</th>
              <th className="py-3.5 px-3">Department</th>
              <th className="py-3.5 px-3">Contract Type</th>
              <th className="py-3.5 px-3">Start Date</th>
              <th className="py-3.5 px-3">End Date</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No contracts found
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Try adjusting your search criteria or filters.
                  </div>
                </td>
              </tr>
            ) : (
              contracts.map((contract) => {
                const isSelectedRow = selectedContract?.id === contract.id;
                const isChecked = selectedIds.includes(contract.id);

                return (
                  <tr
                    key={contract.id}
                    onClick={() => onSelectContract(contract)}
                    className={`transition-colors cursor-pointer ${
                      isSelectedRow
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3.5 pl-4 pr-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelectRow(contract.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        aria-label={`Select contract for ${contract.employeeName}`}
                      />
                    </td>

                    {/* Employee Identity */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        {contract.avatar ? (
                          <img
                            src={contract.avatar}
                            alt={contract.employeeName}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200/80 dark:ring-slate-700"
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              contract.avatarBg || 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {contract.initials || 'EM'}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {contract.employeeName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {contract.designation}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400 font-medium">
                      {contract.employeeId}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {contract.department}
                    </td>

                    {/* Contract Type */}
                    <td className="py-3.5 px-3 text-slate-800 dark:text-slate-200 font-semibold">
                      {contract.contractType}
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                      {contract.startDate}
                    </td>

                    {/* End Date */}
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                      {contract.endDate}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(contract.status)}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 pr-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ContractRowActions
                        contract={contract}
                        onViewContract={onViewContract}
                        onEditContract={onEditContract}
                        onDownloadContract={onDownloadContract}
                        onRenewContract={onRenewContract}
                        onTerminateContract={onTerminateContract}
                        onDeleteContract={onDeleteContract}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
