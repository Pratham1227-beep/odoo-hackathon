import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TimeOffHeader from '../components/TimeOffHeader';
import TimeOffStats from '../components/TimeOffStats';
import TimeOffFilters from '../components/TimeOffFilters';
import TimeOffTable from '../components/TimeOffTable';
import TimeOffPagination from '../components/TimeOffPagination';
import LeaveBalanceCard from '../components/LeaveBalanceCard';
import RequestTimeOffCard from '../components/RequestTimeOffCard';
import CompanyHolidaysCard from '../components/CompanyHolidaysCard';
import NewTimeOffModal from '../components/NewTimeOffModal';
import NewAllocationModal from '../components/NewAllocationModal';
import NewLeaveTypeModal from '../components/NewLeaveTypeModal';
import ApproveRejectModal from '../components/ApproveRejectModal';
import TimeOffDetailModal from '../components/TimeOffDetailModal';
import { timeOffService } from '../services/timeOffService';
import { employeeService } from '../../employees/services/employeeService';
import { useAuthStore } from '../../../store/useAuthStore';
import { CheckCircle2, UserCheck, Download, X, RefreshCw, AlertTriangle } from 'lucide-react';

export default function TimeOffPage() {
  const { user } = useAuthStore();
  const HR_ROLES = ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'];
  const isHR = Boolean(user && HR_ROLES.includes(user.role));

  // API Data State
  const [requests, setRequests] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters and UI state
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'PENDING', 'APPROVED', 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    leaveType: 'All Types',
    status: 'All Statuses',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isNewAllocationModalOpen, setIsNewAllocationModalOpen] = useState(false);
  const [isNewLeaveTypeModalOpen, setIsNewLeaveTypeModalOpen] = useState(false);

  const [requestToEdit, setRequestToEdit] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    mode: 'approve',
    request: null,
  });
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    request: null,
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);

      const [reqData, allocData, typesData, holData] = await Promise.all([
        timeOffService.listRequests(),
        timeOffService.listAllocations({ year: new Date().getFullYear() }),
        timeOffService.listLeaveTypes(),
        timeOffService.listHolidays(new Date().getFullYear()),
      ]);

      setRequests(reqData || []);
      setAllocations(allocData || []);
      setLeaveTypes(typesData || []);
      setHolidays(holData || []);

      if (isHR) {
        try {
          const empList = await employeeService.listAllActiveEmployees();
          setActiveEmployees(empList || []);
        } catch {
          setActiveEmployees([]);
        }
      }
    } catch (err) {
      console.error('Error fetching time-off data:', err);
      setFetchError(err.response?.data?.detail || err.message || 'Failed to load time off records.');
    } finally {
      setIsLoading(false);
    }
  }, [isHR]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Statistics
  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const approved = requests.filter((r) => r.status === 'APPROVED').length;
    const rejected = requests.filter((r) => r.status === 'REJECTED').length;
    const upcoming = approved; // Upcoming scheduled approved leaves

    return {
      all: requests.length,
      pending,
      approved,
      rejected,
      upcoming,
    };
  }, [requests]);

  // Tab counts
  const tabCounts = useMemo(
    () => ({
      all: stats.all,
      pending: stats.pending,
      approved: stats.approved,
      rejected: stats.rejected,
    }),
    [stats]
  );

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Tab filter
      if (activeTab && activeTab !== 'All' && req.status !== activeTab) return false;

      // 2. Search query (matches name, code, leave type, reason)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (req.employee_name || '').toLowerCase().includes(q);
        const matchesCode = (req.employee_code || '').toLowerCase().includes(q);
        const matchesType = (req.leave_type_name || '').toLowerCase().includes(q);
        const matchesReason = (req.reason || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesType && !matchesReason) return false;
      }

      // 3. Leave Type filter
      if (
        filters.leaveType &&
        filters.leaveType !== 'All Types' &&
        req.leave_type_name !== filters.leaveType
      ) {
        return false;
      }

      // 4. Status filter
      if (
        filters.status &&
        filters.status !== 'All Statuses' &&
        req.status !== filters.status
      ) {
        return false;
      }

      return true;
    });
  }, [requests, activeTab, searchQuery, filters]);

  // Pagination calculation
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Handlers
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setSelectedIds([]);
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
    });
    setSearchQuery('');
    setActiveTab('All');
    setCurrentPage(1);
  };

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

  // Create new request
  const handleSaveRequest = async (payload) => {
    try {
      await timeOffService.createRequest(payload);
      showToast('Submitted leave request successfully!');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || err.message || 'Failed to submit request.');
    }
  };

  // Grant allocation
  const handleCreateAllocation = async (payload) => {
    try {
      await timeOffService.createAllocation(payload);
      showToast('Granted leave allocation successfully!');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || err.message || 'Failed to grant allocation.');
    }
  };

  // Create leave type
  const handleCreateLeaveType = async (payload) => {
    try {
      await timeOffService.createLeaveType(payload);
      showToast(`Created leave type "${payload.name}" successfully!`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || err.message || 'Failed to create leave type.');
    }
  };

  // Confirm review (Approve / Reject)
  const handleConfirmAction = async ({ request, mode, rejectionReason }) => {
    try {
      if (mode === 'approve') {
        await timeOffService.reviewRequest(request.id, {
          status: 'APPROVED',
          review_comment: 'Approved by management',
        });
        showToast(`Approved leave request for ${request.employee_name}`);
      } else if (mode === 'reject') {
        await timeOffService.reviewRequest(request.id, {
          status: 'REJECTED',
          review_comment: rejectionReason || 'Request rejected by management',
        });
        showToast(`Rejected leave request for ${request.employee_name}`);
      }
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || err.message || 'Action failed.');
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
        console.error(`Failed to approve ${reqId}:`, err);
      }
    }
    showToast(`Batch approved ${successCount} request(s)!`);
    setSelectedIds([]);
    fetchData();
  };

  // Export CSV
  const handleExportData = () => {
    const toExport =
      selectedIds.length > 0
        ? filteredRequests.filter((r) => selectedIds.includes(r.id))
        : filteredRequests;

    const headers = [
      'Request ID',
      'Employee Code',
      'Employee Name',
      'Leave Type',
      'Start Date',
      'End Date',
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
          `"${r.employee_code || ''}"`,
          `"${r.employee_name || ''}"`,
          `"${r.leave_type_name || ''}"`,
          `"${r.start_date || ''}"`,
          `"${r.end_date || ''}"`,
          `"${r.days || ''}"`,
          `"${r.status || ''}"`,
          `"${r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}"`,
          `"${r.reason || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TimeOff_Requests.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${toExport.length} requests to CSV`);
  };




  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-200 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <TimeOffHeader
        onOpenNewRequest={() => {
          setRequestToEdit(null);
          setIsNewRequestModalOpen(true);
        }}
        onOpenAllocation={isHR ? () => setIsNewAllocationModalOpen(true) : undefined}
        onOpenNewLeaveType={isHR ? () => setIsNewLeaveTypeModalOpen(true) : undefined}
        isHR={isHR}
      />

      {/* Error state alert */}
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

      {/* KPI Statistics Cards */}
      <TimeOffStats
        pendingCount={stats.pending}
        approvedCount={stats.approved}
        rejectedCount={stats.rejected}
        upcomingCount={stats.upcoming}
      />

      {/* Main Grid: Left Table + Right Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols on XL) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
            
            {/* Filter Tabs & Search & Filter */}
            <TimeOffFilters
              activeTab={activeTab}
              onTabChange={handleTabChange}
              counts={tabCounts}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              leaveTypes={leaveTypes}
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
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
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
                <span>Loading time off requests...</span>
              </div>
            ) : (
              <TimeOffTable
                requests={paginatedRequests}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onViewDetails={(req) => setDetailModal({ isOpen: true, request: req })}
                onApprove={(req) => setConfirmModal({ isOpen: true, mode: 'approve', request: req })}
                onReject={(req) => setConfirmModal({ isOpen: true, mode: 'reject', request: req })}
                onCancel={(req) => setConfirmModal({ isOpen: true, mode: 'cancel', request: req })}
                onEdit={(req) => {
                  setRequestToEdit(req);
                  setIsNewRequestModalOpen(true);
                }}
                isHR={isHR}
              />
            )}

            {/* Pagination */}
            <TimeOffPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Right Sidebar Column (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Leave Balance Card */}
          <LeaveBalanceCard
            allocations={allocations}
            onViewAll={() => showToast('Displaying annual leave balance entitlement.')}
          />

          {/* Request Time Off Card */}
          <RequestTimeOffCard
            onOpenNewRequest={() => {
              setRequestToEdit(null);
              setIsNewRequestModalOpen(true);
            }}
          />

          {/* Company Holidays Card */}
          <CompanyHolidaysCard
            holidays={holidays}
            onViewAll={() => showToast('Displaying official company holiday calendar.')}
          />
        </div>
      </div>

      {/* Modals */}
      <NewTimeOffModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSubmit={handleSaveRequest}
        requestToEdit={requestToEdit}
        leaveTypes={leaveTypes}
        employees={activeEmployees}
        isHR={isHR}
      />

      {isHR && (
        <>
          <NewAllocationModal
            isOpen={isNewAllocationModalOpen}
            onClose={() => setIsNewAllocationModalOpen(false)}
            onSubmit={handleCreateAllocation}
            leaveTypes={leaveTypes}
            employees={activeEmployees}
          />

          <NewLeaveTypeModal
            isOpen={isNewLeaveTypeModalOpen}
            onClose={() => setIsNewLeaveTypeModalOpen(false)}
            onSubmit={handleCreateLeaveType}
          />
        </>
      )}

      <ApproveRejectModal
        isOpen={confirmModal.isOpen}
        mode={confirmModal.mode}
        request={confirmModal.request}
        onClose={() => setConfirmModal({ isOpen: false, mode: 'approve', request: null })}
        onConfirm={handleConfirmAction}
      />

      <TimeOffDetailModal
        isOpen={detailModal.isOpen}
        request={detailModal.request}
        onClose={() => setDetailModal({ isOpen: false, request: null })}
        onApprove={(req) => setConfirmModal({ isOpen: true, mode: 'approve', request: req })}
        onReject={(req) => setConfirmModal({ isOpen: true, mode: 'reject', request: req })}
        isHR={isHR}
      />
    </div>
  );
}
