import React, { useState, useEffect, useMemo, useCallback } from 'react';
import LeaveRequestHeader from '../components/LeaveRequestHeader';
import LeaveRequestStats from '../components/LeaveRequestStats';
import LeaveRequestFilters from '../components/LeaveRequestFilters';
import LeaveRequestTable from '../components/LeaveRequestTable';
import LeaveRequestPagination from '../components/LeaveRequestPagination';
import RequestDetails from '../components/RequestDetails';
import LeaveBalance from '../components/LeaveBalance';
import LeaveRequestModal from '../components/LeaveRequestModal';
import ApprovalModal from '../components/ApprovalModal';
import RejectionModal from '../components/RejectionModal';
import LeaveRequestDetailModal from '../components/LeaveRequestDetailModal';
import { timeOffService } from '../../timeOff/services/timeOffService';
import { employeeService } from '../../employees/services/employeeService';
import { useAuthStore } from '../../../store/useAuthStore';
import { CheckCircle2, UserCheck, Download, X, RefreshCw, AlertTriangle } from 'lucide-react';

export default function LeaveRequestPage() {
  const { user } = useAuthStore();
  const isHR = user && ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'].includes(user.role);

  // API Data State
  const [requests, setRequests] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Selection & Filters State
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    leaveType: 'All Types',
    status: 'All Statuses',
    department: 'All Departments',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState(null);
  const [approvalModalState, setApprovalModalState] = useState({ isOpen: false, request: null });
  const [rejectionModalState, setRejectionModalState] = useState({ isOpen: false, request: null });
  const [detailModalState, setDetailModalState] = useState({ isOpen: false, request: null });

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch API Data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);

      const [reqData, allocData, typesData] = await Promise.all([
        timeOffService.listRequests(),
        timeOffService.listAllocations(),
        timeOffService.listLeaveTypes(),
      ]);

      setRequests(reqData || []);
      setAllocations(allocData || []);
      setLeaveTypes(typesData || []);

      if (isHR) {
        try {
          const empList = await employeeService.listAllActiveEmployees();
          setActiveEmployees(empList || []);
        } catch {
          setActiveEmployees([]);
        }
      }
    } catch (err) {
      console.error('Error loading leave requests:', err);
      setFetchError(err.response?.data?.detail || err.message || 'Failed to load leave requests.');
    } finally {
      setIsLoading(false);
    }
  }, [isHR]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format request object for LeaveRequest UI components
  const formattedRequests = useMemo(() => {
    return requests.map((r) => {
      const statusTitle =
        r.status === 'PENDING'
          ? 'Pending'
          : r.status === 'APPROVED'
          ? 'Approved'
          : r.status === 'REJECTED'
          ? 'Rejected'
          : 'Cancelled';

      return {
        ...r,
        id: r.id,
        employeeId: r.employee_code || r.employee_id || 'N/A',
        employeeName: r.employee_name || 'Employee',
        department: r.department_name || 'General',
        leaveType: r.leave_type_name || r.leave_type_code || 'Leave',
        startDate: r.start_date,
        endDate: r.end_date,
        days: parseFloat(r.days || 1),
        status: statusTitle,
        appliedOn: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
        reason: r.reason || '',
        detailedReason: r.reason || '',
        rejectionReason: r.review_comment,
      };
    });
  }, [requests]);

  // Dynamic statistics calculation
  const stats = useMemo(() => {
    const total = formattedRequests.length;
    const pending = formattedRequests.filter((r) => r.status === 'Pending').length;
    const approved = formattedRequests.filter((r) => r.status === 'Approved').length;
    const rejected = formattedRequests.filter((r) => r.status === 'Rejected').length;
    const cancelled = formattedRequests.filter((r) => r.status === 'Cancelled').length;

    return {
      total,
      pending,
      approved,
      rejected,
      cancelled,
    };
  }, [formattedRequests]);

  // Tab counts
  const tabCounts = useMemo(
    () => ({
      all: stats.total,
      pending: stats.pending,
      approved: stats.approved,
      rejected: stats.rejected,
      cancelled: stats.cancelled,
    }),
    [stats]
  );

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return formattedRequests.filter((req) => {
      // 1. Tab filter
      if (activeTab === 'Pending' && req.status !== 'Pending') return false;
      if (activeTab === 'Approved' && req.status !== 'Approved') return false;
      if (activeTab === 'Rejected' && req.status !== 'Rejected') return false;
      if (activeTab === 'Cancelled' && req.status !== 'Cancelled') return false;

      // 2. Month filter (e.g. "Sep 2026")
      if (selectedMonth !== 'All Months') {
        const matchesMonth =
          req.startDate?.includes(selectedMonth.split(' ')[0]) ||
          req.endDate?.includes(selectedMonth.split(' ')[0]) ||
          req.appliedOn?.includes(selectedMonth.split(' ')[0]);
        if (!matchesMonth) return false;
      }

      // 3. Search query (matches employee name, ID, leave type, reason)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (req.employeeName || '').toLowerCase().includes(q);
        const matchesId = (req.employeeId || '').toLowerCase().includes(q);
        const matchesType = (req.leaveType || '').toLowerCase().includes(q);
        const matchesReason = (req.reason || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesType && !matchesReason) return false;
      }

      // 4. Leave Type filter
      if (
        filters.leaveType &&
        filters.leaveType !== 'All Types' &&
        req.leaveType !== filters.leaveType
      ) {
        return false;
      }

      // 5. Status filter
      if (
        filters.status &&
        filters.status !== 'All Statuses' &&
        req.status !== filters.status
      ) {
        return false;
      }

      // 6. Department filter
      if (
        filters.department &&
        filters.department !== 'All Departments' &&
        req.department !== filters.department
      ) {
        return false;
      }

      return true;
    });
  }, [formattedRequests, activeTab, selectedMonth, searchQuery, filters]);

  // Selected Request for Right Rail Details Preview
  const selectedRequest = useMemo(() => {
    if (!selectedRequestId && filteredRequests.length > 0) {
      return filteredRequests[0];
    }
    const matched = formattedRequests.find((r) => r.id === selectedRequestId);
    return matched || filteredRequests[0] || null;
  }, [formattedRequests, filteredRequests, selectedRequestId]);

  // Pagination calculation
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Filter change handlers
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      leaveType: 'All Types',
      status: 'All Statuses',
      department: 'All Departments',
    });
    setSelectedMonth('All Months');
    setSearchQuery('');
    setActiveTab('All');
    setCurrentPage(1);
  };

  // Row selection for right rail
  const handleSelectRequest = (req) => {
    setSelectedRequestId(req.id);
  };

  // Multi-checkbox selection
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRequests.map((r) => r.id));
    }
  };

  // Approve action
  const handleConfirmApprove = async (req) => {
    try {
      await timeOffService.reviewRequest(req.id, {
        status: 'APPROVED',
        review_comment: 'Approved by management',
      });
      showToast(`Approved ${req.leaveType} for ${req.employeeName}`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || err.message || 'Failed to approve request.');
    }
  };

  // Reject action
  const handleConfirmReject = async (req, rejectionReason) => {
    try {
      await timeOffService.reviewRequest(req.id, {
        status: 'REJECTED',
        review_comment: rejectionReason || 'Request rejected by management.',
      });
      showToast(`Rejected leave request for ${req.employeeName}`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || err.message || 'Failed to reject request.');
    }
  };

  // Batch approve
  const handleBatchApprove = async () => {
    let successCount = 0;
    for (const reqId of selectedIds) {
      try {
        await timeOffService.reviewRequest(reqId, {
          status: 'APPROVED',
          review_comment: 'Batch approved',
        });
        successCount += 1;
      } catch (err) {
        console.error(`Batch approve failed for ${reqId}:`, err);
      }
    }
    showToast(`Approved ${successCount} leave request(s)!`);
    setSelectedIds([]);
    fetchData();
  };

  // Submit request
  const handleSaveRequest = async (payload) => {
    await timeOffService.createRequest(payload);
    showToast('Submitted leave request successfully!');
    fetchData();
  };

  // Export CSV
  const handleExportData = () => {
    const toExport =
      selectedIds.length > 0
        ? filteredRequests.filter((r) => selectedIds.includes(r.id))
        : filteredRequests;

    const headers = [
      'ID',
      'Employee Code',
      'Name',
      'Department',
      'Leave Type',
      'From',
      'To',
      'Days',
      'Status',
      'Applied On',
      'Reason',
    ];

    const csvContent = [
      headers.join(','),
      ...toExport.map((r) =>
        [
          `"${r.id}"`,
          `"${r.employeeId}"`,
          `"${r.employeeName}"`,
          `"${r.department}"`,
          `"${r.leaveType}"`,
          `"${r.startDate}"`,
          `"${r.endDate}"`,
          `"${r.days}"`,
          `"${r.status}"`,
          `"${r.appliedOn}"`,
          `"${r.detailedReason || r.reason || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WageWise_Leave_Requests.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${toExport.length} requests to CSV`);
  };

  // Format Allocations for LeaveBalance card
  const formattedBalances = useMemo(() => {
    if (allocations.length > 0) {
      return allocations.map((a) => ({
        id: a.id,
        name: a.leave_type_name || a.leave_type_code || 'Leave',
        used: parseFloat(a.used_days || 0),
        total: parseFloat(a.allocated_days || 0),
        unit: 'days',
      }));
    }
    return [
      { id: 'b1', name: 'Paid Leave', used: 4, total: 18, unit: 'days' },
      { id: 'b2', name: 'Sick Leave', used: 2, total: 12, unit: 'days' },
      { id: 'b3', name: 'Casual Leave', used: 1, total: 6, unit: 'days' },
    ];
  }, [allocations]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <LeaveRequestHeader
        onOpenNewRequest={() => {
          setRequestToEdit(null);
          setIsNewModalOpen(true);
        }}
      />

      {/* Error Banner */}
      {fetchError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Statistics KPI Cards */}
      <LeaveRequestStats
        totalRequests={stats.total}
        pendingCount={stats.pending}
        approvedCount={stats.approved}
        rejectedCount={stats.rejected}
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Table Container (~8 cols on XL) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
            
            {/* Filter Tabs + Month Selector + Filter Popover */}
            <LeaveRequestFilters
              activeTab={activeTab}
              onTabChange={handleTabChange}
              counts={tabCounts}
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />

            {/* Batch Selection Banner */}
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    {selectedIds.length} request{selectedIds.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isHR && (
                    <button
                      onClick={handleBatchApprove}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Approve Selected
                    </button>
                  )}
                  <button
                    onClick={handleExportData}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
                    aria-label="Clear selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Table or Loading */}
            {isLoading ? (
              <div className="py-16 text-center text-xs font-medium text-slate-400 animate-pulse flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                <span>Loading leave requests...</span>
              </div>
            ) : (
              <LeaveRequestTable
                requests={paginatedRequests}
                selectedRequestId={selectedRequest?.id}
                onSelectRequest={handleSelectRequest}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onViewDetails={(req) => setDetailModalState({ isOpen: true, request: req })}
                onApprove={(req) => setApprovalModalState({ isOpen: true, request: req })}
                onReject={(req) => setRejectionModalState({ isOpen: true, request: req })}
                onCancel={(req) => {
                  showToast(`Cancelled leave request for ${req.employeeName}`);
                }}
                onEdit={(req) => {
                  setRequestToEdit(req);
                  setIsNewModalOpen(true);
                }}
              />
            )}

            {/* Pagination */}
            <LeaveRequestPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Right Column: Request Details + Leave Balance (~4 cols on XL) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Request Details Card */}
          <RequestDetails
            request={selectedRequest}
            onApprove={(req) => setApprovalModalState({ isOpen: true, request: req })}
            onReject={(req) => setRejectionModalState({ isOpen: true, request: req })}
          />

          {/* Leave Balance Card */}
          <LeaveBalance
            balances={formattedBalances}
            onViewAll={() => showToast('Displaying comprehensive annual leave entitlements.')}
          />
        </div>
      </div>

      {/* Modals */}
      <LeaveRequestModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleSaveRequest}
        requestToEdit={requestToEdit}
        leaveTypes={leaveTypes}
        employees={activeEmployees}
      />

      <ApprovalModal
        isOpen={approvalModalState.isOpen}
        request={approvalModalState.request}
        onClose={() => setApprovalModalState({ isOpen: false, request: null })}
        onConfirmApprove={handleConfirmApprove}
      />

      <RejectionModal
        isOpen={rejectionModalState.isOpen}
        request={rejectionModalState.request}
        onClose={() => setRejectionModalState({ isOpen: false, request: null })}
        onConfirmReject={handleConfirmReject}
      />

      <LeaveRequestDetailModal
        isOpen={detailModalState.isOpen}
        request={detailModalState.request}
        onClose={() => setDetailModalState({ isOpen: false, request: null })}
        onApprove={(req) => setApprovalModalState({ isOpen: true, request: req })}
        onReject={(req) => setRejectionModalState({ isOpen: true, request: req })}
      />
    </div>
  );
}
