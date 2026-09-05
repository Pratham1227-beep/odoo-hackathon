import React, { useState, useMemo } from 'react';
import WorkingScheduleHeader from '../components/WorkingScheduleHeader';
import ScheduleStats from '../components/ScheduleStats';
import ScheduleTabs from '../components/ScheduleTabs';
import ScheduleFilters from '../components/ScheduleFilters';
import ScheduleTable from '../components/ScheduleTable';
import ScheduleCalendar from '../components/ScheduleCalendar';
import ShiftTypesCard from '../components/ShiftTypesCard';
import UpcomingScheduleChanges from '../components/UpcomingScheduleChanges';
import CreateScheduleModal from '../components/CreateScheduleModal';
import ShiftTemplateModal from '../components/ShiftTemplateModal';
import ScheduleDetailModal from '../components/ScheduleDetailModal';
import ShiftManagementTab from '../components/ShiftManagementTab';
import RotationalSchedulesTab from '../components/RotationalSchedulesTab';
import HolidayCalendarTab from '../components/HolidayCalendarTab';
import ScheduleSettingsTab from '../components/ScheduleSettingsTab';

import { initialEmployeesSchedule } from '../data/workingScheduleData';

export default function WorkingSchedulesPage() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('schedule');

  // Employee schedules state
  const [employeesSchedule, setEmployeesSchedule] = useState(initialEmployeesSchedule);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [scheduleFilter, setScheduleFilter] = useState('All Schedules');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [cellContext, setCellContext] = useState(null);

  // Week offset state (0 = 22 Sep - 28 Sep, -1 = 15 Sep - 21 Sep, 1 = 29 Sep - 05 Oct)
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(22);

  // Dynamic week definitions based on weekOffset
  const { weekRangeText, weekDays } = useMemo(() => {
    if (weekOffset === 0) {
      return {
        weekRangeText: '22 Sep 2026 - 28 Sep 2026',
        weekDays: [
          { key: 'mon', day: 'Mon', date: '22 Sep' },
          { key: 'tue', day: 'Tue', date: '23 Sep' },
          { key: 'wed', day: 'Wed', date: '24 Sep' },
          { key: 'thu', day: 'Thu', date: '25 Sep' },
          { key: 'fri', day: 'Fri', date: '26 Sep' },
          { key: 'sat', day: 'Sat', date: '27 Sep' },
          { key: 'sun', day: 'Sun', date: '28 Sep' },
        ],
      };
    } else if (weekOffset === -1) {
      return {
        weekRangeText: '15 Sep 2026 - 21 Sep 2026',
        weekDays: [
          { key: 'mon', day: 'Mon', date: '15 Sep' },
          { key: 'tue', day: 'Tue', date: '16 Sep' },
          { key: 'wed', day: 'Wed', date: '17 Sep' },
          { key: 'thu', day: 'Thu', date: '18 Sep' },
          { key: 'fri', day: 'Fri', date: '19 Sep' },
          { key: 'sat', day: 'Sat', date: '20 Sep' },
          { key: 'sun', day: 'Sun', date: '21 Sep' },
        ],
      };
    } else if (weekOffset === 1) {
      return {
        weekRangeText: '29 Sep 2026 - 05 Oct 2026',
        weekDays: [
          { key: 'mon', day: 'Mon', date: '29 Sep' },
          { key: 'tue', day: 'Tue', date: '30 Sep' },
          { key: 'wed', day: 'Wed', date: '01 Oct' },
          { key: 'thu', day: 'Thu', date: '02 Oct' },
          { key: 'fri', day: 'Fri', date: '03 Oct' },
          { key: 'sat', day: 'Sat', date: '04 Oct' },
          { key: 'sun', day: 'Sun', date: '05 Oct' },
        ],
      };
    } else {
      // General formula for other weeks
      const baseStart = new Date(2026, 8, 22);
      baseStart.setDate(baseStart.getDate() + weekOffset * 7);
      const baseEnd = new Date(baseStart);
      baseEnd.setDate(baseEnd.getDate() + 6);

      const formatD = (d) =>
        `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('en-US', {
          month: 'short',
        })} ${d.getFullYear()}`;

      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((k, idx) => {
        const d = new Date(baseStart);
        d.setDate(d.getDate() + idx);
        return {
          key: k,
          day: d.toLocaleString('en-US', { weekday: 'short' }),
          date: `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('en-US', {
            month: 'short',
          })}`,
        };
      });

      return {
        weekRangeText: `${formatD(baseStart)} - ${formatD(baseEnd)}`,
        weekDays: days,
      };
    }
  }, [weekOffset]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employeesSchedule.filter((emp) => {
      // Department filter
      if (
        departmentFilter !== 'All Departments' &&
        emp.department !== departmentFilter
      ) {
        return false;
      }

      // Location filter
      if (locationFilter !== 'All Locations' && emp.location !== locationFilter) {
        return false;
      }

      // Schedule Shift filter
      if (scheduleFilter !== 'All Schedules') {
        if (emp.scheduleType !== scheduleFilter) {
          return false;
        }
      }

      return true;
    });
  }, [employeesSchedule, departmentFilter, locationFilter, scheduleFilter]);

  // Handlers
  const handleCellClick = (employee, dayKey, dayData, dayHeader) => {
    setCellContext({ employee, dayKey, dayData, dayHeader });
  };

  const handleSaveCell = (employeeId, dayKey, updatedDayData) => {
    setEmployeesSchedule((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            days: {
              ...emp.days,
              [dayKey]: updatedDayData,
            },
          };
        }
        return emp;
      })
    );
  };

  const handleCreateSchedule = (scheduleConfig) => {
    // Add or update schedules for targeted department or employees
    setEmployeesSchedule((prev) =>
      prev.map((emp) => {
        if (
          scheduleConfig.department === 'All Departments' ||
          emp.department === scheduleConfig.department
        ) {
          const newDays = { ...emp.days };
          const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          const dayNames = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ];

          dayNames.forEach((name, idx) => {
            const k = dayKeys[idx];
            if (scheduleConfig.workingDays[name]) {
              newDays[k] = {
                type: scheduleConfig.location === 'Remote' ? 'remote' : 'shift',
                shiftId: scheduleConfig.shiftType,
                label:
                  scheduleConfig.location === 'Remote'
                    ? 'Remote'
                    : `${scheduleConfig.startTime}\n- ${scheduleConfig.endTime}`,
                time: `${scheduleConfig.startTime} - ${scheduleConfig.endTime}`,
                location: scheduleConfig.location,
              };
            } else {
              newDays[k] = {
                type: 'off',
                label: 'Off',
                time: 'Rest Day',
                location: 'None',
              };
            }
          });

          return { ...emp, days: newDays };
        }
        return emp;
      })
    );
  };

  const handleApplyTemplate = (tpl) => {
    // Apply template across matching department
    setEmployeesSchedule((prev) =>
      prev.map((emp) => {
        if (tpl.department === 'All Departments' || emp.department === tpl.department) {
          const newDays = { ...emp.days };
          const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          const dayNames = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ];

          dayNames.forEach((name, idx) => {
            const k = dayKeys[idx];
            if (tpl.remoteDays?.includes(name)) {
              newDays[k] = {
                type: 'remote',
                label: 'Remote',
                time: tpl.timing,
                location: 'Remote Work',
              };
            } else if (tpl.days.includes(name)) {
              newDays[k] = {
                type: 'shift',
                shiftId: tpl.shiftId,
                label: `${tpl.timing.split('-')[0]?.trim()}\n- ${tpl.timing.split('-')[1]?.trim()}`,
                time: tpl.timing,
                location: tpl.location,
              };
            } else {
              newDays[k] = {
                type: 'off',
                label: 'Off',
                time: 'Rest Day',
                location: 'None',
              };
            }
          });
          return { ...emp, days: newDays };
        }
        return emp;
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Breadcrumb */}
      <WorkingScheduleHeader
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
      />

      {/* 4 Summary KPIs */}
      <ScheduleStats />

      {/* Navigation Tabs */}
      <ScheduleTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Tab 1: Schedule View (Default) */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Main 9 Columns: Filters + Weekly Schedule Table */}
          <div className="xl:col-span-9 space-y-4">
            <ScheduleFilters
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              scheduleFilter={scheduleFilter}
              setScheduleFilter={setScheduleFilter}
              weekRangeText={weekRangeText}
              onPreviousWeek={() => setWeekOffset((prev) => prev - 1)}
              onNextWeek={() => setWeekOffset((prev) => prev + 1)}
            />

            <ScheduleTable
              employees={filteredEmployees}
              weekDays={weekDays}
              onCellClick={handleCellClick}
            />
          </div>

          {/* Right 3 Columns: Calendar, Shift Types, Upcoming Changes */}
          <div className="xl:col-span-3 space-y-5">
            <ScheduleCalendar
              selectedDay={selectedCalendarDay}
              onSelectDay={(day) => setSelectedCalendarDay(day)}
            />

            <ShiftTypesCard onManageShifts={() => setActiveTab('shifts')} />

            <UpcomingScheduleChanges
              onViewAll={() => setActiveTab('rotational')}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Shift Management */}
      {activeTab === 'shifts' && <ShiftManagementTab />}

      {/* Tab 3: Rotational Schedules */}
      {activeTab === 'rotational' && <RotationalSchedulesTab />}

      {/* Tab 4: Holiday Calendar */}
      {activeTab === 'holidays' && <HolidayCalendarTab />}

      {/* Tab 5: Settings */}
      {activeTab === 'settings' && <ScheduleSettingsTab />}

      {/* Modals */}
      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSchedule={handleCreateSchedule}
        availableEmployees={employeesSchedule}
      />

      <ShiftTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      <ScheduleDetailModal
        isOpen={Boolean(cellContext)}
        onClose={() => setCellContext(null)}
        cellContext={cellContext}
        onSaveCell={handleSaveCell}
      />
    </div>
  );
}
