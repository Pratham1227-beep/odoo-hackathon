import React, { useState, useMemo } from 'react';
import { X, Search, Check, ChevronRight, ArrowLeft, Users, Calendar, ShieldCheck } from 'lucide-react';

export default function RunPayrollModal({
  isOpen,
  onClose,
  salaryStructures = [],
  periods = [],
  eligibleEmployees = [],
  onCreatePayrun,
}) {
  const [step, setStep] = useState(1);
  const [selectedStructureId, setSelectedStructureId] = useState(
    salaryStructures[0]?.id || 'STR-001'
  );
  const [selectedPeriod, setSelectedPeriod] = useState('September 2026');
  const [paymentDate, setPaymentDate] = useState('2026-09-30');
  const [payrunNotes, setPayrunNotes] = useState('Standard monthly payroll disbursement');

  // Step 2 state: explicit employee selection
  const [selectedEmpIds, setSelectedEmpIds] = useState(() =>
    eligibleEmployees.map((e) => e.id)
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const filteredEmployees = useMemo(() => {
    return eligibleEmployees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesDept =
        departmentFilter === 'All' || emp.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [eligibleEmployees, searchFilter, departmentFilter]);

  const departments = useMemo(() => {
    return Array.from(new Set(eligibleEmployees.map((e) => e.department)));
  }, [eligibleEmployees]);

  if (!isOpen) return null;

  const handleToggleEmp = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredEmployees.map((e) => e.id);
    const allSelected = filteredIds.every((id) => selectedEmpIds.includes(id));
    if (allSelected) {
      setSelectedEmpIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedEmpIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleCreate = () => {
    const selectedEmployeesList = eligibleEmployees.filter((e) =>
      selectedEmpIds.includes(e.id)
    );

    onCreatePayrun({
      salaryStructureId: selectedStructureId,
      period: selectedPeriod,
      paymentDate,
      notes: payrunNotes,
      selectedEmployeeIds: selectedEmpIds,
      employees: selectedEmployeesList,
    });

    onClose();
  };

  const selectedStructure = salaryStructures.find((s) => s.id === selectedStructureId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Run Payroll Wizard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {step === 1 ? 'Step 1 of 2: Define Payroll Scope & Period' : 'Step 2 of 2: Select Eligible Employees'}
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

        {/* Step Progression indicator */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className={`flex items-center gap-2 text-xs font-semibold ${step === 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
              {step > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
            </span>
            <span>Payroll Scope</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700" />
          <div className={`flex items-center gap-2 text-xs font-semibold ${step === 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              2
            </span>
            <span>Employee Selection</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-5">
              {/* Salary Structure selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Salary Structure
                </label>
                <select
                  value={selectedStructureId}
                  onChange={(e) => setSelectedStructureId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  {salaryStructures.map((struct) => (
                    <option key={struct.id} value={struct.id}>
                      {struct.name} ({struct.code})
                    </option>
                  ))}
                </select>
                {selectedStructure && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedStructure.description}
                  </p>
                )}
              </div>

              {/* Payroll Period selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Payroll Period
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.label}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Disbursement / Pay Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Batch Description / Notes
                </label>
                <input
                  type="text"
                  value={payrunNotes}
                  onChange={(e) => setPayrunNotes(e.target.value)}
                  placeholder="e.g. Regular monthly payroll cycle"
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Rule Summary Pill Box */}
              <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Salary Structure & Compliance Rules Linked</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>• Basic: {selectedStructure?.basicPercentage || 50}% of Gross</div>
                  <div>• HRA: {selectedStructure?.hraPercentage || 25}% of Gross</div>
                  <div>• PF Employee: {selectedStructure?.pfPercentage || 12}% (Capped)</div>
                  <div>• Statutory Prof. Tax: ₹{selectedStructure?.professionalTax || 200}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filter and Search Bar for Employees */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter by name, ID or role..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table of eligible employees */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-500 sticky top-0">
                    <tr>
                      <th className="py-2.5 pl-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            filteredEmployees.length > 0 &&
                            filteredEmployees.every((e) => selectedEmpIds.includes(e.id))
                          }
                          onChange={handleSelectAllFiltered}
                          className="w-3.5 h-3.5 text-indigo-600 rounded cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-2">Employee</th>
                      <th className="py-2.5 px-2">ID</th>
                      <th className="py-2.5 px-2">Department</th>
                      <th className="py-2.5 px-2 text-right">Gross Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEmployees.map((emp) => {
                      const isSelected = selectedEmpIds.includes(emp.id);
                      return (
                        <tr
                          key={emp.id}
                          onClick={() => handleToggleEmp(emp.id)}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <td className="py-2 pl-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 text-indigo-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-2 font-semibold text-slate-800 dark:text-slate-200">
                            {emp.name}
                          </td>
                          <td className="py-2 px-2 text-indigo-600 font-medium">
                            {emp.id}
                          </td>
                          <td className="py-2 px-2 text-slate-500">{emp.department}</td>
                          <td className="py-2 px-2 text-right font-medium text-slate-900 dark:text-white">
                            ₹{emp.grossSalary.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Selection count footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Selected:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {selectedEmpIds.length}
                  </strong>{' '}
                  of {eligibleEmployees.length} employees
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEmpIds(eligibleEmployees.map((e) => e.id))}
                    className="text-indigo-600 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedEmpIds([])}
                    className="text-slate-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/30 transition-colors cursor-pointer"
              >
                <span>Continue to Employee Selection</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={selectedEmpIds.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/30 transition-colors cursor-pointer"
              >
                <span>Create Payrun ({selectedEmpIds.length} Selected)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
