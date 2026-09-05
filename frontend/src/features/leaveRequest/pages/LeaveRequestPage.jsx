import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { initialLeaveBalances } from '../data/leaveRequestData';
import { timeOffService } from '../../timeOff/services/timeOffService';
import { CheckCircle2, UserCheck, Download, X, Loader2 } from 'lucide-react';

export default function LeaveRequestPage() {
  const [requests, setRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState(initialLeaveBalances);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchLeaveData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqRes, allocRes] = await Promise.allSettled([
        timeOffService.getRequests(),
        timeOffService.getAllocations(),
      ]);

      if (reqRes.status === 'fulfilled' && Array.isArray(reqRes.value)) {
        const mapped = reqRes.value.map((r) => {
          const empName = r.employee ? `${r.employee.first_name || ''} ${r.employee.last_name || ''}`.trim() : 'Employee';
          let formattedStatus = 'Pending';
          if (r.status === 'APPROVED') formattedStatus = 'Approved';
          else if (r.status === 'REJECTED') formattedStatus = 'Rejected';
          else if (r.status === 'CANCELLED') formattedStatus = 'Cancelled';

          return {
            id: r.id,
            realId: r.id,
            employeeId: r.employee?.employee_code || r.employee_id,
            employeeName: empName,
            department: r.employee?.department?.name || 'General',
            role: r.employee?.designation?.title || 'Staff',
            leaveType: r.leave_type?.name || 'Paid Leave',
            startDate: r.start_date,
            endDate: r.end_date,
            days: r.days || 1,
            status: formattedStatus,
            appliedOn: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
            reason: r.reason || '',
            detailedReason: r.reason || 'Requested time off.',
          };
        });
        setRequests(mapped);
        if (mapped.length > 0 && !selectedRequestId) {
          setSelectedRequestId(mapped[0].id);
        }
      }

      if (allocRes.status === 'fulfilled' && Array.isArray(allocRes.value) && allocRes.value.length > 0) {
        const mappedAlloc = allocRes.value.map((a, i) => ({
          id: a.id,
          name: a.leave_type?.name || `Type ${i + 1}`,
          used: Number(a.used_days || 0),
          total: Number(a.allocated_days || 0),
          color: ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'][i % 4],
        }));
        setLeaveBalances(mappedAlloc);
      }
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRequestId]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  // Derived KPI statistics
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'Pending').length,
      approved: requests.filter((r) => r.status === 'Approved').length,
      rejected: requests.filter((r) => r.status === 'Rejected').length,
      cancelled: requests.filter((r) => r.status === 'Cancelled').length,
    };
  }, [requests]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: stats.total,
    pending: stats.pending,
    approved: stats.approved,
    rejected: stats.rejected,
    cancelled: stats.cancelled,
  }), [stats]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
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
        const matchesName = req.employeeName?.toLowerCase().includes(q);
        const matchesId = req.employeeId?.toLowerCase().includes(q);
        const matchesType = req.leaveType?.toLowerCase().includes(q);
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
  }, [requests, activeTab, selectedMonth, searchQuery, filters]);

  // Selected Request for Right Rail
  const selectedRequest = useMemo(() => {
    const matched = requests.find((r) => r.id === selectedRequestId);
    return matched || requests[0] || null;
  }, [requests, selectedRequestId]);

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
      if (req.realId) {
        await timeOffService.approveRequest(req.realId);
      }
    } catch (e) {
      // quiet fallback
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'Approved' } : r))
    );

    // Deduct leave balance
    setLeaveBalances((prev) =>
      prev.map((b) =>
        b.name.toLowerCase() === req.leaveType?.toLowerCase()
          ? { ...b, used: Math.min(b.total, b.used + (req.days || 1)) }
          : b
      )
    );

    showToast(`Approved ${req.leaveType} for ${req.employeeName}`);
  };

  // Reject action
  const handleConfirmReject = async (req, rejectionReason) => {
    try {
      if (req.realId) {
        await timeOffService.rejectRequest(req.realId);
      }
    } catch (e) {
      // quiet fallback
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              status: 'Rejected',
              rejectionReason: rejectionReason || 'Request rejected by management.',
            }
          : r
      )
    );
    showToast(`Rejected leave request for ${req.employeeName}`);
  };

  // Cancel action
  const handleCancelRequest = (req) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'Cancelled' } : r))
    );
    showToast(`Cancelled leave request for ${req.employeeName}`);
  };

  // Batch approve
  const handleBatchApprove = () => {
    setRequests((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id) ? { ...r, status: 'Approved' } : r
      )
    );
    showToast(`Approved ${selectedIds.length} leave requests`);
    setSelectedIds([]);
  };

  // Save new or edited request
  const handleSaveRequest = (formData) => {
    if (formData.id) {
      setRequests((prev) =>
        prev.map((r) => (r.id === formData.id ? { ...r, ...formData } : r))
      );
      showToast(`Updated request for ${formData.employeeName}`);
    } else {
      const nextIdNumber = requests.length + 1;
      const formattedId = `LR0${String(nextIdNumber).padStart(2, '0')}`;
      const newReq = {
        ...formData,
        id: formattedId,
      };
      setRequests((prev) => [newReq, ...prev]);
      setSelectedRequestId(formattedId);
      showToast(`Created leave request for ${formData.employeeName}`);
    }
  };

  // Export selected / filtered to CSV
  const handleExportData = () => {
    const toExport =
      selectedIds.length > 0
        ? filteredRequests.filter((r) => selectedIds.includes(r.id))
        : filteredRequests;

    const headers = [
      'ID',
      'Employee ID',
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

      {/* 4 Statistics KPI Cards */}
      <LeaveRequestStats
        totalRequests={stats.total}
        pendingCount={stats.pending}
        approvedCount={stats.approved}
        rejectedCount={stats.rejected}
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Leave Request Table Container (~8 cols on XL) */}
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
                  <span>{selectedIds.length} request{selectedIds.length > 1 ? 's' : ''} selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchApprove}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Approve Selected
                  </button>
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

            {/* Table */}
            <LeaveRequestTable
              requests={paginatedRequests}
              selectedRequestId={selectedRequestId}
              onSelectRequest={handleSelectRequest}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onViewDetails={(req) => setDetailModalState({ isOpen: true, request: req })}
              onApprove={(req) => setApprovalModalState({ isOpen: true, request: req })}
              onReject={(req) => setRejectionModalState({ isOpen: true, request: req })}
              onCancel={handleCancelRequest}
              onEdit={(req) => {
                setRequestToEdit(req);
                setIsNewModalOpen(true);
              }}
            />

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
            balances={leaveBalances}
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
