import React, { useState, useMemo } from 'react';
import SalarySetupHeader from '../components/SalarySetupHeader';
import SalaryBasicDetails from '../components/SalaryBasicDetails';
import SalaryComponentsTable from '../components/SalaryComponentsTable';
import SalarySummaryCard from '../components/SalarySummaryCard';
import PaymentDetailsCard from '../components/PaymentDetailsCard';
import RecentUpdatesCard from '../components/RecentUpdatesCard';
import AddEditComponentModal from '../components/AddEditComponentModal';
import SalaryStructureManager from '../components/SalaryStructureManager';
import {
  initialEmployeeSalaries,
  initialSalaryStructures,
  initialSalaryRules,
  initialRecentUpdates,
  calculateSalarySummary,
  formatCurrency,
} from '../data/salarySetupData';
import {
  ShieldCheck,
  Building,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

const TABS = [
  'Basic Details',
  'Salary Components',
  'Tax & Deductions',
  'Payment Settings',
];

export default function SalarySetupPage() {
  // Employees state
  const [employees, setEmployees] = useState(initialEmployeeSalaries);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('EMP001');

  // Salary structures and rules state
  const [structures, setStructures] = useState(initialSalaryStructures);
  const [rules, setRules] = useState(initialSalaryRules);
  const [updates, setUpdates] = useState(initialRecentUpdates);

  // Active tab state (defaults to 'Basic Details' matching the screenshot)
  const [activeTab, setActiveTab] = useState('Basic Details');

  // Period state (monthly vs annually)
  const [period, setPeriod] = useState('monthly');

  // Modal states for adding/editing allowance or deduction
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'allowance', // 'allowance' | 'deduction'
    initialData: null,
  });

  // Saving state & toast message
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Find currently active employee
  const currentEmployee = useMemo(() => {
    return employees.find((emp) => emp.id === selectedEmployeeId) || employees[0];
  }, [employees, selectedEmployeeId]);

  // Compute live salary summary based on current employee's components
  const salarySummary = useMemo(() => {
    const multiplier = period === 'annually' ? 12 : 1;
    return calculateSalarySummary(
      currentEmployee.basicSalary,
      currentEmployee.allowances,
      currentEmployee.deductions,
      multiplier
    );
  }, [currentEmployee, period]);

  // Handler for basic details field changes
  const handleBasicDetailChange = (field, value) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === currentEmployee.id) {
          const updated = { ...emp, [field]: value };
          // If name changes, update initials
          if (field === 'name') {
            const parts = value.trim().split(' ');
            updated.initials =
              parts.length > 1
                ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                : (parts[0]?.[0] || 'U').toUpperCase();
          }
          return updated;
        }
        return emp;
      })
    );
  };

  // Handler for payment details field changes
  const handlePaymentFieldChange = (field, value) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === currentEmployee.id) {
          return {
            ...emp,
            paymentDetails: {
              ...emp.paymentDetails,
              [field]: value,
            },
          };
        }
        return emp;
      })
    );
  };

  // Allowance handlers
  const handleOpenAddAllowance = () => {
    setModalState({
      isOpen: true,
      type: 'allowance',
      initialData: null,
    });
  };

  const handleOpenAddDeduction = () => {
    setModalState({
      isOpen: true,
      type: 'deduction',
      initialData: null,
    });
  };

  const handleOpenEditComponent = (item, type) => {
    setModalState({
      isOpen: true,
      type,
      initialData: item,
    });
  };

  const handleDeleteComponent = (id, type) => {
    const listKey = type === 'allowance' ? 'allowances' : 'deductions';
    const itemToDelete = currentEmployee[listKey].find((i) => i.id === id);

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === currentEmployee.id) {
          return {
            ...emp,
            [listKey]: emp[listKey].filter((i) => i.id !== id),
          };
        }
        return emp;
      })
    );

    // Record in timeline
    const newUpdate = {
      id: `upd-${Date.now()}`,
      title: `${itemToDelete?.name || 'Component'} removed`,
      author: 'Admin',
      timestamp: 'Just now',
      color: 'rose',
      iconColor: 'bg-rose-500',
      details: `Removed ${itemToDelete?.name || 'item'} from ${currentEmployee.name}'s salary setup.`,
    };
    setUpdates((prev) => [newUpdate, ...prev]);
    showToast(`${itemToDelete?.name || 'Component'} deleted successfully.`);
  };

  const handleSubmitModal = (componentData) => {
    const listKey = modalState.type === 'allowance' ? 'allowances' : 'deductions';
    const isEditing = Boolean(modalState.initialData);

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === currentEmployee.id) {
          let updatedList;
          if (isEditing) {
            updatedList = emp[listKey].map((item) =>
              item.id === componentData.id ? componentData : item
            );
          } else {
            updatedList = [...emp[listKey], componentData];
          }
          return {
            ...emp,
            [listKey]: updatedList,
          };
        }
        return emp;
      })
    );

    // Record in timeline
    const newUpdate = {
      id: `upd-${Date.now()}`,
      title: isEditing
        ? `${componentData.name} updated`
        : `New ${modalState.type} added`,
      author: 'Admin',
      timestamp: 'Just now',
      color: modalState.type === 'allowance' ? 'emerald' : 'indigo',
      iconColor: modalState.type === 'allowance' ? 'bg-emerald-500' : 'bg-indigo-500',
      details: `${componentData.name} (${formatCurrency(componentData.amount)}) configured for ${currentEmployee.name}.`,
    };
    setUpdates((prev) => [newUpdate, ...prev]);

    showToast(
      `${componentData.name} ${isEditing ? 'updated' : 'added'} successfully.`
    );
  };

  // Rule sequence update handler
  const handleUpdateRuleSequence = (newRules) => {
    setRules(newRules);
    showToast('Salary rule sequence updated successfully.');
  };

  const handleToggleRuleStatus = (ruleId) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
    showToast('Salary rule status toggled.');
  };

  // Save changes handler
  const handleSaveAllChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      const newUpdate = {
        id: `upd-${Date.now()}`,
        title: 'Salary setup saved',
        author: 'Admin',
        timestamp: 'Just now',
        color: 'emerald',
        iconColor: 'bg-emerald-500',
        details: `Saved comprehensive salary configuration for ${currentEmployee.name} (${currentEmployee.id}).`,
      };
      setUpdates((prev) => [newUpdate, ...prev]);
      showToast(`Salary setup for ${currentEmployee.name} saved successfully!`);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {toastMessage.message}
          </span>
        </div>
      )}

      {/* 1. Header (Breadcrumb, Title, Employee Selector & Save Button) */}
      <SalarySetupHeader
        employees={employees}
        selectedEmployee={currentEmployee}
        onSelectEmployee={(emp) => setSelectedEmployeeId(emp.id)}
        onSave={handleSaveAllChanges}
        isSaving={isSaving}
      />

      {/* 2. Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 text-sm font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Main Content based on Active Tab */}
      {activeTab === 'Basic Details' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column (Width ~ 68%) */}
          <div className="xl:col-span-8 space-y-6">
            {/* Employee Profile Pill & Form Inputs */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
              <SalaryBasicDetails
                employeeData={currentEmployee}
                onChangeField={handleBasicDetailChange}
              />
            </div>

            {/* Salary Components (Side-by-side Allowances & Deductions) */}
            <SalaryComponentsTable
              allowances={currentEmployee.allowances}
              deductions={currentEmployee.deductions}
              onAddAllowance={handleOpenAddAllowance}
              onAddDeduction={handleOpenAddDeduction}
              onEditComponent={handleOpenEditComponent}
              onDeleteComponent={handleDeleteComponent}
            />
          </div>

          {/* Right Column (Width ~ 32%) */}
          <div className="xl:col-span-4 space-y-5">
            {/* Salary Summary Card */}
            <SalarySummaryCard
              summary={salarySummary}
              period={period}
              onChangePeriod={(p) => setPeriod(p)}
            />

            {/* Payment Details Card */}
            <PaymentDetailsCard
              paymentDetails={currentEmployee.paymentDetails}
              onChangePaymentField={handlePaymentFieldChange}
            />

            {/* Recent Updates Card */}
            <RecentUpdatesCard updates={updates} />
          </div>
        </div>
      )}

      {/* Salary Components Tab (Salary Structure & Ordered Rules) */}
      {activeTab === 'Salary Components' && (
        <div className="space-y-6">
          <SalaryStructureManager
            structures={structures}
            rules={rules}
            onUpdateRuleSequence={handleUpdateRuleSequence}
            onAddRule={handleOpenAddAllowance}
            onToggleRuleStatus={handleToggleRuleStatus}
          />
        </div>
      )}

      {/* Tax & Deductions Tab */}
      {activeTab === 'Tax & Deductions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Tax Regimes & Statutory Deductions</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure standard statutory deduction rules and Indian Income Tax slabs for {currentEmployee.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="text-xs font-bold text-slate-500">Selected Tax Regime</div>
              <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                New Tax Regime (FY 2026-27)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard rebate up to ₹7,00,000 applicable with simplified progressive tax slabs.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="text-xs font-bold text-slate-500">Provident Fund (PF)</div>
              <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                12% of Basic Salary
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Employee contribution ₹2,400 + Employer matching contribution ₹2,400 (EPFO).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="text-xs font-bold text-slate-500">Professional Tax (PT)</div>
              <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                ₹200 / Month
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                State statutory assessment deducted on monthly salary credits.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Employee Deductions Breakdown
            </h4>
            <div className="space-y-2">
              {currentEmployee.deductions.map((ded) => (
                <div
                  key={ded.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs"
                >
                  <span className="font-semibold text-rose-900 dark:text-rose-200">
                    {ded.name}
                  </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(ded.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings Tab */}
      {activeTab === 'Payment Settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Corporate Disbursal & Bank Integration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure corporate payout gateways and NEFT/RTGS batch file automation for salary disbursements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PaymentDetailsCard
              paymentDetails={currentEmployee.paymentDetails}
              onChangePaymentField={handlePaymentFieldChange}
            />

            <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span>Automated Payroll Batch Generator</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                When monthly payrun is executed, WageWise automatically compiles formatted bank files for direct API disbursement or corporate net banking upload.
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Bank Payout Gateway
                  </span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    HDFC Corporate Direct
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Batch File Format
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    HDFC ENET CSV (12 Columns)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding / Editing Allowance or Deduction */}
      <AddEditComponentModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        initialData={modalState.initialData}
        basicSalary={currentEmployee.basicSalary}
        onClose={() => setModalState({ isOpen: false, type: 'allowance', initialData: null })}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}
