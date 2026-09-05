import React, { useState, useMemo, useEffect, useCallback } from 'react';
import AttendanceHeader from '../components/AttendanceHeader';
import AttendanceStats from '../components/AttendanceStats';
import AttendanceFilterTabs from '../components/AttendanceFilterTabs';
import AttendanceTable from '../components/AttendanceTable';
import AttendanceCalendar from '../components/AttendanceCalendar';
import AttendanceOverview from '../components/AttendanceOverview';
import AttendanceQuickActions from '../components/AttendanceQuickActions';
import MarkAttendanceModal from '../components/MarkAttendanceModal';
import ApplyLeaveModal from '../components/ApplyLeaveModal';
import AttendanceDetailModal from '../components/AttendanceDetailModal';
import AttendanceReportModal from '../components/AttendanceReportModal';
import { attendanceService } from '../services/attendanceService';
import { timeOffService } from '../../timeOff/services/timeOffService';
import { employeeService } from '../../employees/services/employeeService';
import { Download, CheckCircle2, UserCheck, X, Loader2 } from 'lucide-react';

const avatarThemes = ['purple', 'blue', 'pink', 'teal', 'violet', 'sky', 'rose', 'mint'];

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: 'All Departments',
    status: 'All Statuses',
    workLocation: 'All Locations',
    attendanceType: 'All Types',
  });
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchAttendanceRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const [attRes, empRes] = await Promise.allSettled([
        attendanceService.listAttendances({
          from: selectedDate,
          to: selectedDate,
          page: 1,
          page_size: 500,
        }),
        employeeService.getEmployees({ page: 1, page_size: 500 }),
      ]);

      const attItems = attRes.status === 'fulfilled' && attRes.value?.items ? attRes.value.items : [];
      const realEmps = empRes.status === 'fulfilled' && empRes.value?.items ? empRes.value.items : [];

      if (attItems.length > 0) {
        const mapped = attItems.map((r, index) => {
          const empName = r.employee ? `${r.employee.first_name || ''} ${r.employee.last_name || ''}`.trim() : 'Employee';
          const initials = empName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'EM';
          
          let checkInTime = '-';
          if (r.clock_in) {
            const d = new Date(r.clock_in);
            checkInTime = !isNaN(d) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
          }
          let checkOutTime = '-';
          if (r.clock_out) {
            const d = new Date(r.clock_out);
            checkOutTime = !isNaN(d) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
          }

          let formattedStatus = 'Present';
          if (r.status === 'PRESENT') formattedStatus = 'Present';
          else if (r.status === 'LATE') formattedStatus = 'Late';
          else if (r.status === 'ABSENT') formattedStatus = 'Absent';
          else if (r.status === 'HALF_DAY') formattedStatus = 'Half Day';
          else if (r.status === 'ON_LEAVE') formattedStatus = 'On Leave';

          return {
            id: r.id,
            realId: r.id,
            employeeId: r.employee?.employee_code || r.employee_id,
            employeeName: empName,
            initials: initials,
            avatarTheme: avatarThemes[index % avatarThemes.length],
            department: r.employee?.department?.name || 'General',
            role: r.employee?.designation?.title || 'Staff',
            date: r.date || selectedDate,
            checkIn: checkInTime,
            checkOut: checkOutTime,
            workHours: r.work_hours ? `${r.work_hours}h` : '-',
            status: formattedStatus,
            workLocation: 'Office',
            attendanceType: r.source === 'BIOMETRIC' ? 'Biometric' : 'Manual',
            notes: r.notes || '',
          };
        });
        setRecords(mapped);
      } else if (realEmps.length > 0) {
        // Map all real organization employees for this date
        const mapped = realEmps.map((emp, index) => {
          const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Employee';
          const initials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'EM';
          return {
            id: `att-emp-${emp.id}`,
            realId: null,
            employeeId: emp.employee_code || emp.id,
            employeeName: fullName,
            initials: initials,
            avatarTheme: avatarThemes[index % avatarThemes.length],
            department: emp.department?.name || emp.department_name || 'General',
            role: emp.designation?.title || emp.designation_title || 'Staff',
            date: selectedDate,
            checkIn: '-',
            checkOut: '-',
            workHours: '-',
            status: 'Absent',
            workLocation: emp.work_location?.name || 'Office',
            attendanceType: 'Manual',
            notes: '',
          };
        });
        setRecords(mapped);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  // Derive Workforce Stats dynamically
  const stats = useMemo(() => {
    const presentInTable = records.filter((r) => r.status === 'Present').length;
    const absentInTable = records.filter((r) => r.status === 'Absent').length;
    const leaveInTable = records.filter((r) => r.status === 'On Leave').length;
    const lateInTable = records.filter((r) => r.status === 'Late').length;

    return {
      total: records.length,
      present: presentInTable,
      absent: absentInTable,
      leave: leaveInTable,
      late: lateInTable,
    };
  }, [records]);

  // Filtered attendance records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Tab filter
      if (activeTab === 'Present' && rec.status !== 'Present') return false;
      if (activeTab === 'Absent' && rec.status !== 'Absent') return false;
      if (activeTab === 'On Leave' && rec.status !== 'On Leave') return false;
      if (activeTab === 'Late' && rec.status !== 'Late') return false;

      // 2. Search query (matches name, id, department)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = rec.employeeName?.toLowerCase().includes(q);
        const matchesId = rec.employeeId?.toLowerCase().includes(q);
        const matchesDept = rec.department?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDept) return false;
      }

      // 3. Department filter
      if (
        filters.department &&
        filters.department !== 'All Departments' &&
        rec.department !== filters.department
      ) {
        return false;
      }

      // 4. Status filter
      if (
        filters.status &&
        filters.status !== 'All Statuses' &&
        rec.status !== filters.status
      ) {
        return false;
      }

      // 5. Work Location filter
      if (
        filters.workLocation &&
        filters.workLocation !== 'All Locations' &&
        rec.workLocation !== filters.workLocation
      ) {
        return false;
      }

      // 6. Attendance Type filter
      if (
        filters.attendanceType &&
        filters.attendanceType !== 'All Types' &&
        rec.attendanceType !== filters.attendanceType
      ) {
        return false;
      }

      return true;
    });
  }, [records, activeTab, searchQuery, filters]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: stats.total,
      present: stats.present,
      absent: stats.absent,
      leave: stats.leave,
      late: stats.late,
    };
  }, [stats]);

  // Multi-selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  // Filter change handlers
  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => {
    setFilters({
      department: 'All Departments',
      status: 'All Statuses',
      workLocation: 'All Locations',
      attendanceType: 'All Types',
    });
    setSearchQuery('');
    setActiveTab('All');
  };

  // Save / Update Attendance
  const handleSaveAttendance = (formData) => {
    if (formData.id) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === formData.id
            ? {
                ...r,
                ...formData,
                workHours:
                  formData.checkIn && formData.checkOut
                    ? formData.workHours || '8h 00m'
                    : '-',
              }
            : r
        )
      );
      showToast(`Updated attendance for ${formData.employeeName}`);
    } else {
      const newRec = {
        ...formData,
        id: `ATT-${selectedDate.replace(/-/g, '')}-${Date.now().toString().slice(-3)}`,
      };
      setRecords((prev) => [newRec, ...prev]);
      showToast(`Recorded attendance for ${formData.employeeName}`);
    }
  };

  // Row Quick Actions
  const handleQuickCheckIn = async (record) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      await attendanceService.checkIn();
    } catch (e) {
      // quiet fallback
    }

    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              checkIn: currentTime,
              status: 'Present',
              notes: `Checked in at ${currentTime}`,
            }
          : r
      )
    );
    showToast(`Checked in ${record.employeeName} at ${currentTime}`);
  };

  const handleQuickCheckOut = async (record) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      await attendanceService.checkOut();
    } catch (e) {
      // quiet fallback
    }

    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              checkOut: currentTime,
              workHours: '8h 00m',
              notes: `Checked out at ${currentTime}`,
            }
          : r
      )
    );
    showToast(`Checked out ${record.employeeName} at ${currentTime}`);
  };

  const handleAddNote = (record) => {
    setRecordToEdit(record);
    setIsMarkModalOpen(true);
  };

  const handleViewDetails = (record) => {
    setDetailRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleEditAttendance = (record) => {
    setRecordToEdit(record);
    setIsMarkModalOpen(true);
  };

  // Batch actions
  const handleBatchMarkPresent = () => {
    setRecords((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id)
          ? {
              ...r,
              status: 'Present',
              checkIn: r.checkIn === '-' ? '09:00 AM' : r.checkIn,
              checkOut: r.checkOut === '-' ? '06:00 PM' : r.checkOut,
              workHours: r.workHours === '-' ? '8h 00m' : r.workHours,
            }
          : r
      )
    );
    showToast(`Marked ${selectedIds.length} employees as Present`);
    setSelectedIds([]);
  };

  // Real Export to CSV
  const handleExportData = () => {
    const recordsToExport =
      selectedIds.length > 0
        ? filteredRecords.filter((r) => selectedIds.includes(r.id))
        : filteredRecords;

    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Date',
      'Check In',
      'Check Out',
      'Work Hours',
      'Status',
      'Location',
      'Type',
      'Notes',
    ];

    const csvRows = [
      headers.join(','),
      ...recordsToExport.map((r) =>
        [
          `"${r.employeeId}"`,
          `"${r.employeeName}"`,
          `"${r.department}"`,
          `"${r.date}"`,
          `"${r.checkIn}"`,
          `"${r.checkOut}"`,
          `"${r.workHours}"`,
          `"${r.status}"`,
          `"${r.workLocation}"`,
          `"${r.attendanceType}"`,
          `"${r.notes || ''}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WageWise_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${recordsToExport.length} attendance records to CSV`);
  };

  const handleApplyLeaveSubmit = (formData) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.employeeId === formData.employeeId
          ? {
              ...r,
              status: 'On Leave',
              checkIn: '-',
              checkOut: '-',
              workHours: '-',
              notes: `${formData.leaveType}: ${formData.reason || 'Requested leave'}`,
            }
          : r
      )
    );
    showToast(`Applied ${formData.leaveType} for ${formData.employeeId}`);
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

      {/* Top Header: Title, Subtitle, Date Picker & Mark Attendance Button */}
      <AttendanceHeader
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onOpenMarkModal={() => {
          setRecordToEdit(null);
          setIsMarkModalOpen(true);
        }}
      />

      {/* 4 Statistics KPI Cards */}
      <AttendanceStats
        totalEmployees={stats.total}
        presentCount={stats.present}
        absentCount={stats.absent}
        leaveCount={stats.leave}
      />

      {/* Main Grid: Left Column (Table Card) + Right Rail (Calendar, Overview, Quick Actions) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols on XL) */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* Main Attendance Card Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
            
            {/* Filter Tabs + Search + Filter Button */}
            <AttendanceFilterTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={tabCounts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />

            {/* Batch Selection Banner */}
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{selectedIds.length} employee{selectedIds.length > 1 ? 's' : ''} selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchMarkPresent}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Mark Present
                  </button>
                  <button
                    onClick={handleExportData}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Selected</span>
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

            {/* Attendance Table */}
            <AttendanceTable
              records={filteredRecords}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onViewDetails={handleViewDetails}
              onEditAttendance={handleEditAttendance}
              onQuickCheckIn={handleQuickCheckIn}
              onQuickCheckOut={handleQuickCheckOut}
              onAddNote={handleAddNote}
            />

            {/* Table Footer Count & Summary */}
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span>
                Showing {filteredRecords.length} of {stats.total} employees
              </span>
              <span>
                Date: {selectedDate}
              </span>
            </div>

          </div>

        </div>

        {/* Right Rail Column (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Attendance Calendar Card */}
          <AttendanceCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Today's Overview Donut Chart Card */}
          <AttendanceOverview
            totalEmployees={stats.total}
            presentCount={stats.present}
            absentCount={stats.absent}
            leaveCount={stats.leave}
          />

          {/* Quick Actions 2x2 Grid Card */}
          <AttendanceQuickActions
            onMarkAttendance={() => {
              setRecordToEdit(null);
              setIsMarkModalOpen(true);
            }}
            onApplyLeave={() => setIsLeaveModalOpen(true)}
            onViewReports={() => setIsReportModalOpen(true)}
            onExportData={handleExportData}
          />

        </div>

      </div>

      {/* Modals */}
      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        onSave={handleSaveAttendance}
        recordToEdit={recordToEdit}
        selectedDate={selectedDate}
      />

      <ApplyLeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmitLeave={handleApplyLeaveSubmit}
        selectedDate={selectedDate}
      />

      <AttendanceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={detailRecord}
        onEdit={(rec) => {
          setRecordToEdit(rec);
          setIsMarkModalOpen(true);
        }}
      />

      <AttendanceReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        records={filteredRecords}
        selectedDate={selectedDate}
      />

    </div>
  );
}
