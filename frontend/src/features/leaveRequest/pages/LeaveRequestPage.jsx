import React, { useState, useMemo } from 'react';
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
import {
  initialLeaveRequests,
  initialLeaveBalances,
} from '../data/leaveRequestData';
import { CheckCircle2, UserCheck, Download, X } from 'lucide-react';

export default function LeaveRequestPage() {
  const [requests, setRequests] = useState(initialLeaveRequests);
  const [leaveBalances, setLeaveBalances] = useState(initialLeaveBalances);
  const [selectedRequestId, setSelectedRequestId] = useState('LR001'); // Default to Ayesha Siddiqui
  const [activeTab, setActiveTab] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('Sep 2026');
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

  // Derive Statistics dynamically from requests dataset
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const approved = requests.filter((r) => r.status === 'Approved').length;
    const rejected = requests.filter((r) => r.status === 'Rejected').length;
    const cancelled = requests.filter((r) => r.status === 'Cancelled').length;

    return {
      total,
      pending,
      approved,
      rejected,
      cancelled,
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
          req.startDate.includes(selectedMonth.split(' ')[0]) ||
          req.endDate.includes(selectedMonth.split(' ')[0]) ||
          req.appliedOn.includes(selectedMonth.split(' ')[0]);
        if (!matchesMonth) return false;
      }

      // 3. Search query (matches employee name, ID, leave type, reason)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = req.employeeName.toLowerCase().includes(q);
        const matchesId = req.employeeId.toLowerCase().includes(q);
        const matchesType = req.leaveType.toLowerCase().includes(q);
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
    setSelectedMonth('Sep 2026');
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
  const handleConfirmApprove = (req) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'Approved' } : r))
    );

    // Deduct leave balance
    setLeaveBalances((prev) =>
      prev.map((b) =>
        b.name.toLowerCase() === req.leaveType.toLowerCase()
          ? { ...b, used: Math.min(b.total, b.used + (req.days || 1)) }
          : b
      )
    );

    showToast(`Approved ${req.leaveType} for ${req.employeeName}`);
  };

  // Reject action
  const handleConfirmReject = (req, rejectionReason) => {
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
