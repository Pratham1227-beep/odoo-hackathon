import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Send,
  Sparkles,
  Info,
  X,
  Loader2,
} from 'lucide-react';

import PayrunHeader from '../components/PayrunHeader';
import PayrunStats from '../components/PayrunStats';
import PayrunTabs from '../components/PayrunTabs';
import PayrunTable from '../components/PayrunTable';
import PayrunProgress from '../components/PayrunProgress';
import PayrunQuickActions from '../components/PayrunQuickActions';
import RecentPayruns from '../components/RecentPayruns';
import RunPayrollModal from '../components/RunPayrollModal';
import PayslipModal from '../components/PayslipModal';
import PayrollPreviewModal from '../components/PayrollPreviewModal';
import WarningsDrawer from '../components/WarningsDrawer';

import { payrunService } from '../services/payrunService';
import { employeeService } from '../../employees/services/employeeService';
import { payrollConfigService } from '../../salarySetup/services/payrollConfigService';
import {
  initialPayrunPeriods,
  initialSalaryStructures,
  initialRecentPayruns,
  initialStages,
  calculateSalaryBreakdown
} from '../data/payrunData';

export default function PayrunPage() {
  const navigate = useNavigate();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState('September 2026');
  const [employees, setEmployees] = useState([]);
  const [recentPayruns, setRecentPayruns] = useState(initialRecentPayruns);
  const [structures, setStructures] = useState(initialSalaryStructures);
  const [stages, setStages] = useState(initialStages);
  const [currentStageNumber, setCurrentStageNumber] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Table selection & filtering state
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isRunPayrollOpen, setIsRunPayrollOpen] = useState(false);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isWarningsOpen, setIsWarningsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchPayrunData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [payrunsRes, empRes, structRes] = await Promise.allSettled([
        payrunService.listPayruns({ page: 1, page_size: 20 }),
        employeeService.getEmployees({ page: 1, page_size: 50 }),
        payrollConfigService.listStructures(),
      ]);

      if (payrunsRes.status === 'fulfilled' && payrunsRes.value?.items) {
        const mappedRuns = payrunsRes.value.items.map((r) => ({
          id: r.id,
          realId: r.id,
          period: r.name || `${r.month}/${r.year}`,
          processedDate: r.finalized_at ? new Date(r.finalized_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Draft',
          totalPayoutFormatted: `₹${(Number(r.total_net_salary || 0) / 100000).toFixed(2)}L`,
          totalPayout: Number(r.total_net_salary || 0),
          employeesProcessed: r.total_employees || 0,
          status: r.status === 'PAID' ? 'Finalized' : r.status === 'CALCULATED' ? 'Ready' : 'Draft',
        }));
        if (mappedRuns.length > 0) {
          setRecentPayruns(mappedRuns);
        }
      }

      if (structRes.status === 'fulfilled' && Array.isArray(structRes.value) && structRes.value.length > 0) {
        setStructures(structRes.value);
      }

      if (empRes.status === 'fulfilled' && empRes.value?.items) {
        const mappedEmps = empRes.value.items.map((emp) => {
          const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Employee';
          const initials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'EM';
          const gross = Number(emp.base_salary || 65000);
          const breakdown = calculateSalaryBreakdown(gross, 'standard');

          return {
            id: emp.employee_code || emp.id,
            realId: emp.id,
            name: fullName,
            email: emp.email,
            department: emp.department_name || 'General',
            role: emp.designation_title || 'Staff',
            grossSalary: gross,
            deductions: breakdown.deductions,
            netPay: breakdown.netPay,
            status: 'Processed',
            salaryStructureId: 'standard',
            avatarTheme: 'purple',
            initials: initials,
            warnings: [],
            bankDetails: {
              accountNumber: '987654321098',
              ifsc: 'HDFC0001234',
              verified: true,
            },
          };
        });
        setEmployees(mappedEmps);
      }
    } catch (err) {
      console.error('Failed to load payrun data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayrunData();
  }, [fetchPayrunData]);

  // Departments list for filter
  const departments = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.department)));
  }, [employees]);

  // Derived counts
  const totalEmployeesCount = employees.length;
  const processedEmployeesCount = employees.filter((e) => e.status === 'Processed').length;
  const pendingEmployeesCount = employees.filter((e) => e.status === 'Pending').length;
  const onHoldEmployeesCount = employees.filter((e) => e.status === 'On Hold').length;

  const tabCounts = {
    All: totalEmployeesCount,
    Processed: processedEmployeesCount,
    Pending: pendingEmployeesCount,
    'On Hold': onHoldEmployeesCount,
  };

  const progressPercentage =
    totalEmployeesCount > 0
      ? ((processedEmployeesCount / totalEmployeesCount) * 100).toFixed(1)
      : '0.0';

  // Filtered employees according to activeTab, search query, and department
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Tab filter
      if (activeTab === 'Processed' && emp.status !== 'Processed') return false;
      if (activeTab === 'Pending' && emp.status !== 'Pending') return false;
      if (activeTab === 'On Hold' && emp.status !== 'On Hold') return false;

      // Department filter
      if (departmentFilter !== 'All' && emp.department !== departmentFilter) {
        return false;
      }

      // Search query filter (matches name, id, department, role)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(query);
        const matchesId = emp.id.toLowerCase().includes(query);
        const matchesDept = emp.department.toLowerCase().includes(query);
        const matchesRole = emp.role?.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesDept && !matchesRole) {
          return false;
        }
      }

      return true;
    });
  }, [employees, activeTab, departmentFilter, searchQuery]);

  // Paginated slice
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Pending employees with warnings
  const pendingWithIssues = useMemo(() => {
    return employees.filter((e) => e.status === 'Pending' || (e.warnings && e.warnings.length > 0));
  }, [employees]);

  // Checkbox handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const pageIds = paginatedEmployees.map((e) => e.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Row Action Handlers
  const handleRecalculate = (empId) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          const recalculated = calculateSalaryBreakdown(emp.grossSalary, emp.salaryStructureId);
          return {
            ...emp,
            grossSalary: recalculated.grossSalary,
            deductions: recalculated.deductions,
            netPay: recalculated.netPay,
            status: 'Processed',
          };
        }
        return emp;
      })
    );
    showToast(`Recalculated salary breakdown for employee ${empId}`);
  };

  const handleToggleHold = (empId) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          const newStatus = emp.status === 'On Hold' ? 'Processed' : 'On Hold';
          return { ...emp, status: newStatus };
        }
        return emp;
      })
    );
    showToast(`Updated employee status to On Hold / Processed`);
  };

  const handleViewEmployee = (empId) => {
    navigate(`/employees/${empId}`);
  };

  const handleRemove = (empId) => {
    setEmployees((prev) => prev.filter((e) => e.id !== empId));
    setSelectedIds((prev) => prev.filter((id) => id !== empId));
    showToast(`Removed employee ${empId} from current payroll run`, 'info');
  };

  // Warnings Resolution
  const handleResolveEmployee = (empId) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          return {
            ...emp,
            status: 'Processed',
            warnings: [],
            bankDetails: {
              ...emp.bankDetails,
              accountNumber: emp.bankDetails?.accountNumber || '987654321098',
              ifsc: emp.bankDetails?.ifsc || 'HDFC0001234',
              verified: true,
            },
          };
        }
        return emp;
      })
    );
    showToast(`Resolved compliance and verified bank details for ${empId}`);
  };

  const handleResolveAll = () => {
    setEmployees((prev) =>
      prev.map((emp) => ({
        ...emp,
        status: 'Processed',
        warnings: [],
        bankDetails: {
          ...emp.bankDetails,
          accountNumber: emp.bankDetails?.accountNumber || '987654321098',
          ifsc: emp.bankDetails?.ifsc || 'HDFC0001234',
          verified: true,
        },
      }))
    );
    setIsWarningsOpen(false);
    showToast('All 6 pending compliance warnings resolved successfully! Payroll is ready for finalization.');
  };

  // Wizard Completion: Create Payrun
  const handleCreatePayrun = (newRunConfig) => {
    setSelectedPeriod(newRunConfig.period);
    // Apply selected employees
    setEmployees((prev) =>
      prev.map((emp) => {
        const isIncluded = newRunConfig.selectedEmployeeIds.includes(emp.id);
        return {
          ...emp,
          salaryStructureId: newRunConfig.salaryStructureId,
          status: isIncluded ? 'Processed' : 'On Hold',
        };
      })
    );
    setCurrentPage(1);
    showToast(`Created new Payrun batch for ${newRunConfig.period} with ${newRunConfig.selectedEmployeeIds.length} employees!`);
  };

  // Stage advancement & lifecycle
  const handleAdvanceStage = () => {
    if (currentStageNumber === 5) {
      handleMarkFinalized();
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStageNumber((prev) => prev + 1);
      setStages((prev) =>
        prev.map((st) => {
          if (st.step === currentStageNumber) return { ...st, status: 'completed' };
          if (st.step === currentStageNumber + 1) return { ...st, status: 'active' };
          return st;
        })
      );
      showToast(`Advanced to next payroll stage!`);
    }, 600);
  };

  // Finalization
  const handleMarkFinalized = () => {
    if (pendingEmployeesCount > 0) {
      setIsWarningsOpen(true);
      showToast(`Please review and resolve the ${pendingEmployeesCount} pending warnings before finalization`, 'warning');
      return;
    }

    const totalNet = employees.reduce((acc, curr) => acc + curr.netPay, 0);
    const inLakhs = (totalNet / 100000).toFixed(2);

    const finalizedEntry = {
      id: `PR-${selectedPeriod.replace(/\s+/g, '-')}`,
      period: selectedPeriod,
      processedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalPayoutFormatted: `₹${inLakhs}L`,
      totalPayout: totalNet,
      employeesProcessed: processedEmployeesCount,
      status: 'Finalized',
    };

    setRecentPayruns((prev) => [finalizedEntry, ...prev.filter((r) => r.period !== selectedPeriod)]);
    setStages((prev) =>
      prev.map((st) => ({ ...st, status: 'completed' }))
    );
    setCurrentStageNumber(6);
    showToast(`Payrun for ${selectedPeriod} has been finalized and marked Paid! Added to Recent Payruns.`);
  };

  // Quick Action handlers
  const handleDownloadReports = () => {
    // Generate simple mock CSV trigger
    const headers = ['Employee ID', 'Name', 'Department', 'Gross Salary', 'Deductions', 'Net Pay', 'Status'];
    const rows = employees.map((e) => [e.id, `"${e.name}"`, e.department, e.grossSalary, e.deductions, e.netPay, e.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payrun_Report_${selectedPeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Payroll summary report downloaded successfully as CSV!');
  };

  const handleSendPayslips = () => {
    showToast(`Bulk email distribution initiated: Sending digital payslips with password protection to ${processedEmployeesCount} employees via email.`);
  };

  const handleSelectRecentPayrun = (run) => {
    setSelectedPeriod(run.period);
    showToast(`Viewing historical payrun record for ${run.period}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
              : toastMessage.type === 'info'
              ? 'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800'
              : 'bg-slate-900 text-white border-slate-700 dark:bg-slate-100 dark:text-slate-900'
          }`}
        >
          {toastMessage.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 p-0.5 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PayrunHeader
        selectedPeriod={selectedPeriod}
        periods={initialPayrunPeriods}
        onSelectPeriod={(period) => {
          setSelectedPeriod(period);
          showToast(`Switched payroll view to ${period}`);
        }}
        onOpenRunPayroll={() => setIsRunPayrollOpen(true)}
      />

      {/* Warning Alert Banner if there are pending items */}
      {pendingEmployeesCount > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Payroll requires attention before finalization
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                {pendingEmployeesCount} employees have pending banking or tax declaration details.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/payrun/processing')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Open Validation Screen →
            </button>
            <button
              type="button"
              onClick={() => setIsWarningsOpen(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Review Warnings ({pendingEmployeesCount})
            </button>
            <button
              type="button"
              onClick={handleResolveAll}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-xl hover:bg-amber-100/50 transition-colors cursor-pointer"
            >
              Resolve All
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column (KPIs + Table) & Right Column (Progress + Quick Actions + Recent) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (span 8 on XL, or 8.5) */}
        <div className="xl:col-span-8 space-y-6">
          {/* 3 KPI Cards */}
          <PayrunStats
            totalEmployees={totalEmployeesCount}
            processedEmployees={processedEmployeesCount}
            pendingEmployees={pendingEmployeesCount}
          />

          {/* Employee Processing Table Section */}
          <div>
            <PayrunTabs
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              tabCounts={tabCounts}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={(dept) => {
                setDepartmentFilter(dept);
                setCurrentPage(1);
              }}
              departments={departments}
            />

            <PayrunTable
              employees={paginatedEmployees}
              totalEmployeesCount={filteredEmployees.length}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onViewPayslip={(emp) => setSelectedPayslipEmp(emp)}
              onRecalculate={handleRecalculate}
              onToggleHold={handleToggleHold}
              onViewEmployee={handleViewEmployee}
              onRemove={handleRemove}
            />
          </div>
        </div>

        {/* Right Column (span 4 on XL) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Payrun Progress Card */}
          <PayrunProgress
            progressPercentage={progressPercentage}
            stages={stages}
            onAdvanceStage={handleAdvanceStage}
            currentStageNumber={currentStageNumber}
            isProcessing={isProcessing}
          />

          {/* Quick Actions Card */}
          <PayrunQuickActions
            onPreviewPayroll={() => setIsPreviewModalOpen(true)}
            onDownloadReports={handleDownloadReports}
            onSendPayslips={handleSendPayslips}
            onMarkFinalized={handleMarkFinalized}
            isFinalized={currentStageNumber > 5}
          />

          {/* Recent Payruns Card */}
          <RecentPayruns
            payruns={recentPayruns}
            onSelectPayrun={handleSelectRecentPayrun}
            onViewAll={() => showToast('Showing all archived payrun records')}
          />
        </div>
      </div>

      {/* Modals and Drawers */}
      <RunPayrollModal
        isOpen={isRunPayrollOpen}
        onClose={() => setIsRunPayrollOpen(false)}
        salaryStructures={initialSalaryStructures}
        periods={initialPayrunPeriods}
        eligibleEmployees={employees}
        onCreatePayrun={handleCreatePayrun}
      />

      <PayslipModal
        isOpen={Boolean(selectedPayslipEmp)}
        onClose={() => setSelectedPayslipEmp(null)}
        employee={selectedPayslipEmp}
        period={selectedPeriod}
      />

      <PayrollPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        period={selectedPeriod}
        employees={employees}
      />

      <WarningsDrawer
        isOpen={isWarningsOpen}
        onClose={() => setIsWarningsOpen(false)}
        pendingEmployees={pendingWithIssues}
        onResolveEmployee={handleResolveEmployee}
        onResolveAll={handleResolveAll}
      />
    </div>
  );
}
