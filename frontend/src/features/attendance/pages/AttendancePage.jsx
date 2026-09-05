import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { employeeService } from '../../employees/services/employeeService';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  buildDaySheetRecords,
  buildUiPayloadToApi,
  formatDateISO,
  getApiErrorMessage,
  isHrRole,
  mapAttendanceToUi,
  mapEmployeeToUi,
} from '../utils/attendanceMappers';
import { Download, CheckCircle2, UserCheck, X, Loader2, AlertCircle } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const isHr = isHrRole(user?.role);

  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()));
  const [records, setRecords] = useState([]);
  const [calendarRecords, setCalendarRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [myEmployee, setMyEmployee] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: 'All Departments',
    status: 'All Statuses',
    workLocation: 'All Locations',
    attendanceType: 'All Types',
  });
  const [selectedIds, setSelectedIds] = useState([]);

  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const todayISO = formatDateISO(new Date());
  const isToday = selectedDate === todayISO;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const employeeFilterId = searchParams.get('employee');

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      if (isHr) {
        const [empList, attendancePage, summaryData] = await Promise.all([
          employeeService.listAllActiveEmployees(),
          attendanceService.listAttendances({
            from: selectedDate,
            to: selectedDate,
            page: 1,
            page_size: 100,
            ...(employeeFilterId ? { employee_id: employeeFilterId } : {}),
          }),
          attendanceService.getSummary({ from: selectedDate, to: selectedDate }).catch(() => null),
        ]);

        const mappedEmployees = empList.map(mapEmployeeToUi);
        setEmployees(mappedEmployees);
        setSummary(summaryData);

        let dayRecords = buildDaySheetRecords(
          mappedEmployees,
          attendancePage.items || [],
          selectedDate
        );

        if (employeeFilterId) {
          dayRecords = dayRecords.filter((r) => r.employeeUuid === employeeFilterId);
        }

        setRecords(dayRecords);
        setCalendarRecords(dayRecords);
      } else {
        const [y, m] = selectedDate.split('-').map(Number);
        const monthStart = `${y}-${String(m).padStart(2, '0')}-01`;
        const lastDay = new Date(y, m, 0).getDate();
        const monthEnd = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const [me, attendancePage, todayAtt, summaryData] = await Promise.all([
          employeeService.getMyEmployee().catch(() => null),
          attendanceService.listAttendances({
            from: monthStart,
            to: monthEnd,
            page: 1,
            page_size: 100,
          }),
          isToday
            ? attendanceService.getToday().catch(() => null)
            : Promise.resolve(null),
          attendanceService
            .getSummary({ from: monthStart, to: monthEnd })
            .catch(() => null),
        ]);

        const mappedMe = me ? mapEmployeeToUi(me) : null;
        setMyEmployee(mappedMe);
        setEmployees(mappedMe ? [mappedMe] : []);
        setSummary(summaryData);

        const empMap = mappedMe ? { [mappedMe.id]: mappedMe } : {};
        let items = attendancePage.items || [];

        if (isToday && todayAtt && !items.find((a) => a.id === todayAtt.id)) {
          items = [todayAtt, ...items];
        }

        const allMapped = items.map((att) => mapAttendanceToUi(att, empMap));
        setCalendarRecords(allMapped);

        const dayRecords = allMapped.filter((r) => r.date === selectedDate);
        if (dayRecords.length > 0) {
          setRecords(dayRecords);
        } else if (mappedMe) {
          setRecords(buildDaySheetRecords([mappedMe], [], selectedDate));
        } else {
          setRecords([]);
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load attendance'));
      setRecords([]);
      setCalendarRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user, isHr, selectedDate, employeeFilterId, isToday]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const present = records.filter(
      (r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Half Day'
    ).length;
    const late = records.filter((r) => r.status === 'Late').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const leave = records.filter(
      (r) => r.status === 'On Leave' || r.status === 'Holiday'
    ).length;

    return {
      total: records.length,
      present,
      absent,
      leave,
      late,
      summary,
    };
  }, [records, summary]);

  const departmentOptions = useMemo(() => {
    const set = new Set(employees.map((e) => e.department).filter(Boolean));
    return ['All Departments', ...Array.from(set).sort()];
  }, [employees]);

  const locationOptions = useMemo(() => {
    const set = new Set(employees.map((e) => e.workLocation).filter(Boolean));
    return ['All Locations', ...Array.from(set).sort()];
  }, [employees]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (activeTab === 'Present' && !(rec.status === 'Present' || rec.status === 'Half Day')) {
        return false;
      }
      if (activeTab === 'Absent' && rec.status !== 'Absent') return false;
      if (
        activeTab === 'On Leave' &&
        !(rec.status === 'On Leave' || rec.status === 'Holiday')
      ) {
        return false;
      }
      if (activeTab === 'Late' && rec.status !== 'Late') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (rec.employeeName || '').toLowerCase().includes(q);
        const matchesId = String(rec.employeeId || '').toLowerCase().includes(q);
        const matchesDept = (rec.department || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDept) return false;
      }

      if (
        filters.department &&
        filters.department !== 'All Departments' &&
        rec.department !== filters.department
      ) {
        return false;
      }

      if (
        filters.status &&
        filters.status !== 'All Statuses' &&
        rec.status !== filters.status
      ) {
        return false;
      }

      if (
        filters.workLocation &&
        filters.workLocation !== 'All Locations' &&
        rec.workLocation !== filters.workLocation
      ) {
        return false;
      }

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

  const tabCounts = useMemo(
    () => ({
      all: stats.total,
      present: stats.present,
      absent: stats.absent,
      leave: stats.leave,
      late: stats.late,
    }),
    [stats]
  );

  const myRecord = useMemo(() => {
    if (myEmployee) {
      return records.find((r) => r.employeeUuid === myEmployee.id) || records[0] || null;
    }
    return records[0] || null;
  }, [records, myEmployee]);

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

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      await attendanceService.clockIn();
      showToast('Clocked in successfully');
      await loadData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Clock-in failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await attendanceService.clockOut();
      showToast('Clocked out successfully');
      await loadData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Clock-out failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAttendance = async (formData) => {
    if (!isHr) {
      showToast('Only HR can mark attendance for others. Use Clock In/Out for yourself.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = buildUiPayloadToApi(formData);
      await attendanceService.upsertAttendance(payload);
      showToast(
        formData.attendanceId
          ? `Updated attendance for ${formData.employeeName}`
          : `Recorded attendance for ${formData.employeeName}`
      );
      await loadData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to save attendance'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickCheckIn = async (record) => {
    if (!isHr) {
      if (!isToday) {
        showToast('Self clock-in is only available for today');
        return;
      }
      await handleClockIn();
      return;
    }

    setActionLoading(true);
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const payload = buildUiPayloadToApi({
        ...record,
        employeeUuid: record.employeeUuid,
        date: selectedDate,
        checkIn: timeStr,
        checkOut: record.checkOut === '-' ? null : record.checkOut,
        status: 'Present',
      });
      await attendanceService.upsertAttendance(payload);
      showToast(`Checked in ${record.employeeName}`);
      await loadData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Check-in failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickCheckOut = async (record) => {
    if (!isHr) {
      if (!isToday) {
        showToast('Self clock-out is only available for today');
        return;
      }
      await handleClockOut();
      return;
    }

    setActionLoading(true);
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const payload = buildUiPayloadToApi({
        ...record,
        employeeUuid: record.employeeUuid,
        date: selectedDate,
        checkIn: record.checkIn === '-' ? '09:00 AM' : record.checkIn,
        checkOut: timeStr,
        status: record.status === 'Late' ? 'Late' : 'Present',
      });
      await attendanceService.upsertAttendance(payload);
      showToast(`Checked out ${record.employeeName}`);
      await loadData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Check-out failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = (record) => {
    if (!isHr) {
      showToast('Notes / edits are managed by HR. Request a correction from record details.');
      return;
    }
    setRecordToEdit(record);
    setIsMarkModalOpen(true);
  };

  const handleViewDetails = (record) => {
    setDetailRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleEditAttendance = (record) => {
    if (!isHr) {
      showToast('Only HR can edit attendance records');
      return;
    }
    setRecordToEdit(record);
    setIsMarkModalOpen(true);
  };

  const handleBatchMarkPresent = async () => {
    if (!isHr) {
      showToast('Only HR can batch-mark attendance');
      return;
    }
    setActionLoading(true);
    try {
      const selected = filteredRecords.filter((r) => selectedIds.includes(r.id));
      await Promise.all(
        selected.map((r) =>
          attendanceService.upsertAttendance(
            buildUiPayloadToApi({
              ...r,
              employeeUuid: r.employeeUuid,
              date: selectedDate,
              checkIn: r.checkIn === '-' ? '09:00 AM' : r.checkIn,
              checkOut: r.checkOut === '-' ? '06:00 PM' : r.checkOut,
              status: 'Present',
            })
          )
        )
      );
      showToast(`Marked ${selected.length} employees as Present`);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Batch update failed'));
    } finally {
      setActionLoading(false);
    }
  };

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

  const handleApplyLeaveSubmit = () => {
    showToast('Leave requests are handled in the Leave module');
  };

  const roleLabel = isHr
    ? user?.role?.replace(/_/g, ' ') || 'HR'
    : 'Employee';

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-200 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <AttendanceHeader
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onOpenMarkModal={() => {
          if (!isHr) {
            showToast('Use Clock In / Clock Out for your own attendance');
            return;
          }
          setRecordToEdit(null);
          setIsMarkModalOpen(true);
        }}
        isHr={isHr}
        isToday={isToday}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        clockInDisabled={
          actionLoading ||
          !isToday ||
          (myRecord && myRecord.checkIn && myRecord.checkIn !== '-')
        }
        clockOutDisabled={
          actionLoading ||
          !isToday ||
          !myRecord ||
          !myRecord.checkIn ||
          myRecord.checkIn === '-' ||
          (myRecord.checkOut && myRecord.checkOut !== '-')
        }
        showSelfClock={!isHr || Boolean(myEmployee)}
        roleLabel={roleLabel}
        actionLoading={actionLoading}
      />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={loadData}
            className="ml-auto underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <AttendanceStats
        totalEmployees={stats.total}
        presentCount={stats.present}
        absentCount={stats.absent}
        leaveCount={stats.leave}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
            <AttendanceFilterTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={tabCounts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              departmentOptions={departmentOptions}
              locationOptions={locationOptions}
            />

            {isHr && selectedIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    {selectedIds.length} employee
                    {selectedIds.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchMarkPresent}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
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

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <p className="text-xs font-semibold">Loading attendance…</p>
              </div>
            ) : (
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
                isHr={isHr}
                showSelection={isHr}
              />
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span>
                Showing {filteredRecords.length} of {stats.total}{' '}
                {isHr ? 'employees' : 'records'}
              </span>
              <span>Date: {selectedDate}</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <AttendanceCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            records={calendarRecords}
          />

          <AttendanceOverview
            totalEmployees={stats.total}
            presentCount={stats.present}
            absentCount={stats.absent}
            leaveCount={stats.leave}
          />

          <AttendanceQuickActions
            isHr={isHr}
            isToday={isToday}
            onMarkAttendance={() => {
              if (!isHr) {
                showToast('Use Clock In / Clock Out for your own attendance');
                return;
              }
              setRecordToEdit(null);
              setIsMarkModalOpen(true);
            }}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onApplyLeave={() => setIsLeaveModalOpen(true)}
            onViewReports={() => setIsReportModalOpen(true)}
            onExportData={handleExportData}
            clockInDisabled={
              actionLoading ||
              !isToday ||
              (myRecord && myRecord.checkIn && myRecord.checkIn !== '-')
            }
            clockOutDisabled={
              actionLoading ||
              !isToday ||
              !myRecord ||
              !myRecord.checkIn ||
              myRecord.checkIn === '-' ||
              (myRecord.checkOut && myRecord.checkOut !== '-')
            }
          />
        </div>
      </div>

      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        onSave={handleSaveAttendance}
        recordToEdit={recordToEdit}
        selectedDate={selectedDate}
        employees={employees}
        isHr={isHr}
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
          if (!isHr) return;
          setRecordToEdit(rec);
          setIsMarkModalOpen(true);
        }}
        isHr={isHr}
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
