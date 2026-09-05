import React, { useState, useMemo, useEffect, useCallback } from 'react';
import TimeOffHeader from '../components/TimeOffHeader';
import TimeOffStats from '../components/TimeOffStats';
import TimeOffFilters from '../components/TimeOffFilters';
import TimeOffTable from '../components/TimeOffTable';
import TimeOffPagination from '../components/TimeOffPagination';
import LeaveBalanceCard from '../components/LeaveBalanceCard';
import RequestTimeOffCard from '../components/RequestTimeOffCard';
import CompanyHolidaysCard from '../components/CompanyHolidaysCard';
import NewTimeOffModal from '../components/NewTimeOffModal';
import ApproveRejectModal from '../components/ApproveRejectModal';
import TimeOffDetailModal from '../components/TimeOffDetailModal';
import { initialLeaveBalances, companyHolidays } from '../data/timeOffData';
import { timeOffService } from '../services/timeOffService';
import { attendanceService } from '../../attendance/services/attendanceService';
import { CheckCircle2, UserCheck, Download, X, Loader2 } from 'lucide-react';

export default function TimeOffPage() {
  const [requests, setRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState(initialLeaveBalances);
  const [holidaysList, setHolidaysList] = useState(companyHolidays);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    leaveType: 'All Types',
    status: 'All Statuses',
    department: 'All Departments',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
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

  const fetchTimeOffData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqRes, allocRes, holRes] = await Promise.allSettled([
        timeOffService.getRequests(),
        timeOffService.getAllocations(),
        attendanceService.listHolidays(),
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
            leaveType: r.leave_type?.name || 'Paid Leave',
            startDate: r.start_date,
            endDate: r.end_date,
            days: r.days || 1,
            status: formattedStatus,
            appliedOn: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
            reason: r.reason || '',
          };
        });
        setRequests(mapped);
      }

      if (allocRes.status === 'fulfilled' && Array.isArray(allocRes.value) && allocRes.value.length > 0) {
        const mappedAlloc = allocRes.value.map((a, i) => ({
          id: a.id,
          name: a.leave_type?.name || `Leave Type ${i + 1}`,
          used: Number(a.used_days || 0),
          total: Number(a.allocated_days || 0),
          color: ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'][i % 4],
        }));
        setLeaveBalances(mappedAlloc);
      }

      if (holRes.status === 'fulfilled' && Array.isArray(holRes.value) && holRes.value.length > 0) {
        const mappedHolidays = holRes.value.map((h) => ({
          id: h.id,
          name: h.name,
          date: h.date,
          day: new Date(h.date).toLocaleDateString('en-GB', { weekday: 'short' }),
          type: h.type || 'Public Holiday',
        }));
        setHolidaysList(mappedHolidays);
      }
    } catch (err) {
      console.error('Failed to load time-off data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeOffData();
  }, [fetchTimeOffData]);

  // Derived KPI statistics
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'Pending').length,
      approved: requests.filter((r) => r.status === 'Approved').length,
      rejected: requests.filter((r) => r.status === 'Rejected').length,
      cancelled: requests.filter((r) => r.status === 'Cancelled').length,
      upcoming: requests.filter((r) => r.status === 'Approved' && new Date(r.startDate) > new Date()).length,
    };
  }, [requests]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: requests.length,
    pending: stats.pending,
    approved: stats.approved,
    rejected: stats.rejected,
    cancelled: stats.cancelled,
  }), [requests.length, stats]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Tab filter
      if (activeTab === 'Pending' && req.status !== 'Pending') return false;
      if (activeTab === 'Approved' && req.status !== 'Approved') return false;
      if (activeTab === 'Rejected' && req.status !== 'Rejected') return false;
      if (activeTab === 'Cancelled' && req.status !== 'Cancelled') return false;

      // 2. Search query (matches name, id, leave type)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = req.employeeName?.toLowerCase().includes(q);
        const matchesId = req.employeeId?.toLowerCase().includes(q);
        const matchesType = req.leaveType?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesType) return false;
      }

      // 3. Leave Type filter
      if (
        filters.leaveType &&
        filters.leaveType !== 'All Types' &&
        req.leaveType !== filters.leaveType
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

      // 5. Department filter
      if (
        filters.department &&
        filters.department !== 'All Departments' &&
        req.department !== filters.department
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
      department: 'All Departments',
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

  // Submit new/edited request
  const handleSaveRequest = (formData) => {
    if (formData.id) {
      setRequests((prev) =>
        prev.map((r) => (r.id === formData.id ? { ...r, ...formData } : r))
      );
      showToast(`Updated request ${formData.id} for ${formData.employeeName}`);
    } else {
      const newId = `REQ-0${requests.length + 1}`;
      const newReq = {
        ...formData,
        id: newId,
      };
      setRequests((prev) => [newReq, ...prev]);
      showToast(`Submitted leave request for ${formData.employeeName}`);
    }
  };

  // Confirm approve / reject / cancel
  const handleConfirmAction = async ({ request, mode, rejectionReason }) => {
    if (mode === 'approve') {
      try {
        if (request.realId) {
          await timeOffService.approveRequest(request.realId);
        }
      } catch (e) {
        // quiet fallback
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: 'Approved' } : r))
      );

      // Deduct from leave balance if matching leave type
      setLeaveBalances((prev) =>
        prev.map((b) =>
          b.name.toLowerCase() === request.leaveType?.toLowerCase()
            ? { ...b, used: Math.min(b.total, b.used + (request.days || 1)) }
            : b
        )
      );

      showToast(`Approved ${request.leaveType} for ${request.employeeName}`);
    } else if (mode === 'reject') {
      try {
        if (request.realId) {
          await timeOffService.rejectRequest(request.realId);
        }
      } catch (e) {
        // quiet fallback
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? {
                ...r,
                status: 'Rejected',
                rejectionReason: rejectionReason || 'Request rejected by HR.',
              }
            : r
        )
      );
      showToast(`Rejected leave request for ${request.employeeName}`);
    } else if (mode === 'cancel') {
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: 'Cancelled' } : r))
      );
      showToast(`Cancelled leave request for ${request.employeeName}`);
    }
  };

  // Batch approve
  const handleBatchApprove = () => {
    setRequests((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id) ? { ...r, status: 'Approved' } : r
      )
    );
    showToast(`Approved ${selectedIds.length} time off requests`);
    setSelectedIds([]);
  };

  // Export CSV
  const handleExportData = () => {
    const toExport =
      selectedIds.length > 0
        ? filteredRequests.filter((r) => selectedIds.includes(r.id))
        : filteredRequests;

    const headers = [
      'Request ID',
      'Employee ID',
      'Name',
      'Department',
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
          `"${r.employeeId}"`,
          `"${r.employeeName}"`,
          `"${r.department}"`,
          `"${r.leaveType}"`,
          `"${r.startDate}"`,
          `"${r.endDate}"`,
          `"${r.days}"`,
          `"${r.status}"`,
          `"${r.appliedOn}"`,
          `"${r.reason || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WageWise_TimeOff_Requests.csv`);
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
      />

      {/* 4 KPI Statistics Cards */}
      <TimeOffStats
        pendingCount={stats.pending}
        approvedCount={stats.approved}
        rejectedCount={stats.rejected}
        upcomingCount={stats.upcoming}
      />

      {/* Main Grid: Left Column (Table Card) + Right Sidebar */}
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
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                    aria-label="Clear selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
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
            />

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
            balances={leaveBalances}
            onViewAll={() => showToast('Displaying comprehensive leave balance policy.')}
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
            holidays={holidaysList}
            onViewAll={() => showToast('Displaying annual company holiday calendar.')}
          />

        </div>

      </div>

      {/* Modals */}
      <NewTimeOffModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSubmit={handleSaveRequest}
        requestToEdit={requestToEdit}
      />

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
      />

    </div>
  );
}
