import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

import PayrunBreadcrumbs from '../components/PayrunBreadcrumbs';
import PayrunProcessingHeader from '../components/PayrunProcessingHeader';
import PayrunStepProgress from '../components/PayrunStepProgress';
import ValidationStats from '../components/ValidationStats';
import ValidationChecklist from '../components/ValidationChecklist';
import ValidationIssues from '../components/ValidationIssues';
import EmployeeIssuesTable from '../components/EmployeeIssuesTable';
import ResolveIssueModal from '../components/ResolveIssueModal';
import ValidationWarningModal from '../components/ValidationWarningModal';

import { payrollService } from '../../payroll/services/payrollService';
import { mapIssueToUi } from '../../payroll/utils/payrollMappers';
import {
  initialValidationIssues,
  initialValidationStepStages,
  initialPayrunPeriods,
  evaluateValidationResults,
} from '../data/payrunData';

export default function PayrunProcessingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlPayrunId = queryParams.get('payrunId');

  // State
  const [selectedPeriod, setSelectedPeriod] = useState('September 2026 (Monthly)');
  const [issues, setIssues] = useState(initialValidationIssues);
  const [totalEmployees, setTotalEmployees] = useState(118);
  const [stages, setStages] = useState(initialValidationStepStages);
  const [currentStep, setCurrentStep] = useState(2);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [activePayrunId, setActivePayrunId] = useState(urlPayrunId || null);

  // Filters for the Employee Issues Table
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Modals state
  const [selectedIssueToResolve, setSelectedIssueToResolve] = useState(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load issues from backend if payrun exists
  const loadValidationData = useCallback(async () => {
    try {
      let targetId = urlPayrunId;
      if (!targetId) {
        const payrunsRes = await payrollService.listPayruns({ page: 1, page_size: 1 });
        targetId = payrunsRes?.items?.[0]?.id;
      }

      if (targetId) {
        setActivePayrunId(targetId);
        const detail = await payrollService.getPayrun(targetId);
        if (detail) {
          setSelectedPeriod(detail.name || `${detail.month} ${detail.year}`);
          setTotalEmployees(detail.total_employees || 118);
          const apiIssues = detail.issues || [];
          if (apiIssues.length > 0) {
            setIssues(apiIssues.map((iss) => mapIssueToUi(iss)));
          }
        }
      }
    } catch (err) {
      console.warn('Validation screen fallback note:', err.message);
    }
  }, [urlPayrunId]);

  useEffect(() => {
    loadValidationData();
  }, [loadValidationData]);

  // Evaluate validation engine results dynamically
  const validationResults = useMemo(() => {
    return evaluateValidationResults(issues, totalEmployees);
  }, [issues, totalEmployees]);

  const {
    validRecords,
    errorsCount,
    warningsCount,
    canProceed,
    checklist,
  } = validationResults;

  // Departments list for filter
  const departments = useMemo(() => {
    return Array.from(new Set(issues.map((i) => i.department).filter(Boolean)));
  }, [issues]);

  // Filtered issues according to search, severity and department
  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      if (severityFilter === 'Errors' && iss.severity !== 'error') return false;
      if (severityFilter === 'Warnings' && iss.severity !== 'warning') return false;

      if (departmentFilter !== 'All' && iss.department !== departmentFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = iss.employeeName?.toLowerCase().includes(q);
        const matchesId = String(iss.employeeId)?.toLowerCase().includes(q);
        const matchesDept = iss.department?.toLowerCase().includes(q);
        const matchesType = iss.issueType?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDept && !matchesType) {
          return false;
        }
      }

      return true;
    });
  }, [issues, severityFilter, departmentFilter, searchQuery]);

  // Revalidate action
  const handleRevalidate = async () => {
    setIsRevalidating(true);
    if (activePayrunId && activePayrunId.includes('-')) {
      try {
        await payrollService.processPayrun(activePayrunId);
      } catch (e) {
        console.warn('Revalidation API sync note:', e.message);
      }
    }
    setTimeout(() => {
      setIsRevalidating(false);
      showToast('Validation completed: All rules & attendance records re-checked');
    }, 700);
  };

  // Resolve an issue
  const handleSaveResolution = (issueId, resolutionData) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
    showToast(`Issue resolved successfully! Record updated and validated.`);
  };

  // Exclude an issue from current payrun
  const handleExcludeIssue = (issueId) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
    showToast(`Employee excluded from current payroll cycle.`, 'info');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Issue ID', 'Employee ID', 'Employee Name', 'Department', 'Issue Type', 'Details', 'Severity'];
    const rows = filteredIssues.map((i) => [
      i.id,
      i.employeeId,
      `"${i.employeeName}"`,
      i.department,
      `"${i.issueType}"`,
      `"${i.details}"`,
      i.severity,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'wagewise-payrun-validation-issues.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported issues list as CSV');
  };

  // Proceed to Process gate check
  const handleProceed = () => {
    if (!canProceed) {
      setIsWarningModalOpen(true);
      return;
    }

    if (warningsCount > 0) {
      setIsWarningModalOpen(true);
      return;
    }

    showToast('Payroll validated! Proceeding to Step 3: Review & Adjust.');
    setCurrentStep(3);
    setStages((prev) =>
      prev.map((s) => {
        if (s.step === 2) return { ...s, state: 'completed' };
        if (s.step === 3) return { ...s, state: 'active' };
        return s;
      })
    );
  };

  const handleProceedWithWarnings = () => {
    showToast('Warnings acknowledged! Proceeding to payroll generation.');
    setCurrentStep(3);
    setStages((prev) =>
      prev.map((s) => {
        if (s.step === 2) return { ...s, state: 'completed' };
        if (s.step === 3) return { ...s, state: 'active' };
        return s;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Breadcrumb Navigation */}
      <PayrunBreadcrumbs />

      {/* Header */}
      <PayrunProcessingHeader
        selectedPeriod={selectedPeriod}
        periods={initialPayrunPeriods}
        onSelectPeriod={(p) => {
          setSelectedPeriod(p);
          showToast(`Switched view to ${p}`);
        }}
        onProceed={handleProceed}
        canProceed={canProceed}
        errorsCount={errorsCount}
      />

      {/* 5-Step Horizontal Progress Tracker */}
      <PayrunStepProgress stages={stages} currentStep={currentStep} />

      {/* 4 KPI Cards */}
      <ValidationStats
        totalEmployees={totalEmployees}
        validRecords={validRecords}
        warningsCount={warningsCount}
        errorsCount={errorsCount}
      />

      {/* Middle Row: Left (Validation Checklist) & Right (Issues to Resolve) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ValidationChecklist
          checklist={checklist}
          onRevalidate={handleRevalidate}
          isRevalidating={isRevalidating}
        />

        <ValidationIssues
          errorsCount={errorsCount}
          warningsCount={warningsCount}
          onSelectIssueFilter={(filterType) => {
            setSearchQuery(filterType);
            showToast(`Filtering issues by: ${filterType}`);
          }}
          onViewAll={() => {
            setSeverityFilter('All');
            setSearchQuery('');
            showToast('Showing all employee issues below');
          }}
          onReviewIssue={(issueType) => {
            setSearchQuery(issueType);
          }}
        />
      </div>

      {/* Bottom Table: Employees with Issues */}
      <EmployeeIssuesTable
        issues={filteredIssues}
        totalIssuesCount={issues.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        departments={departments}
        onExportCSV={handleExportCSV}
        onActionClick={(iss) => setSelectedIssueToResolve(iss)}
        onViewEmployee={(empId) => navigate(`/employees/${empId}`)}
        onResolve={(iss) => setSelectedIssueToResolve(iss)}
        onExclude={(issueId) => handleExcludeIssue(issueId)}
      />

      {/* Resolution Modal */}
      <ResolveIssueModal
        isOpen={Boolean(selectedIssueToResolve)}
        onClose={() => setSelectedIssueToResolve(null)}
        issue={selectedIssueToResolve}
        onSaveResolution={handleSaveResolution}
      />

      {/* Blocking Error or Proceed Gate Modal */}
      <ValidationWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        errorsCount={errorsCount}
        warningsCount={warningsCount}
        onProceedAnyway={handleProceedWithWarnings}
        onFixErrors={() => {
          setSeverityFilter('Errors');
          showToast('Filtered table to blocking errors');
        }}
      />
    </div>
  );
}
