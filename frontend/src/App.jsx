import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import SignupPage from './features/auth/pages/SignupPage';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import EmployeesPage from './features/employees/pages/EmployeesPage';
import EmployeeProfilePage from './features/employees/pages/EmployeeProfilePage';
import AttendancePage from './features/attendance/pages/AttendancePage';
import TimeOffPage from './features/timeOff/pages/TimeOffPage';
import LeaveRequestPage from './features/leaveRequest/pages/LeaveRequestPage';
import SalarySetupPage from './features/salarySetup/pages/SalarySetupPage';
import PayrunPage from './features/payrun/pages/PayrunPage';
import PayrunProcessingPage from './features/payrun/pages/PayrunProcessingPage';
import PayslipViewPage from './features/payrun/pages/PayslipViewPage';
import PayrollPage from './features/payroll/pages/PayrollPage';
import WorkingSchedulesPage from './features/workingSchedules/pages/WorkingSchedulesPage';
import ContractsPage from './features/contracts/pages/ContractsPage';
import NotificationsPage from './features/notifications/pages/NotificationsPage';
import AppLayout from './shared/layout/AppLayout';
import ProtectedRoute from './shared/components/ProtectedRoute';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('wagewise-theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('wagewise-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('wagewise-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LandingPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
        />
        <Route
          path="/signup"
          element={<SignupPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
        />
        <Route
          path="/login"
          element={<LoginPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <EmployeesPage />
            </AppLayout>
          }
        />
        <Route
          path="/employees/:employeeId"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <EmployeeProfilePage />
            </AppLayout>
          }
        />
        <Route
          path="/attendance"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <AttendancePage />
            </AppLayout>
          }
        />
        <Route
          path="/time-off"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <TimeOffPage />
            </AppLayout>
          }
        />
        <Route
          path="/leave-request"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <LeaveRequestPage />
            </AppLayout>
          }
        />
        <Route
          path="/leave-management"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <LeaveRequestPage />
            </AppLayout>
          }
        />
        <Route
          path="/salary-setup"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <SalarySetupPage />
            </AppLayout>
          }
        />
        <Route
          path="/payrun"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayrunPage />
            </AppLayout>
          }
        />
        <Route
          path="/payrun/processing"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayrunProcessingPage />
            </AppLayout>
          }
        />
        <Route
          path="/payrun/validation"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayrunProcessingPage />
            </AppLayout>
          }
        />
        <Route
          path="/payroll"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayrollPage />
            </AppLayout>
          }
        />
        <Route
          path="/payroll/processing"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayrunProcessingPage />
            </AppLayout>
          }
        />
        <Route
          path="/payroll/payslips/:employeeId"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayslipViewPage />
            </AppLayout>
          }
        />
        <Route
          path="/payroll/payslips"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayslipViewPage />
            </AppLayout>
          }
        />
        <Route
          path="/payrun/payslips/:employeeId"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayslipViewPage />
            </AppLayout>
          }
        />
        <Route
          path="/payrun/payslips"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayslipViewPage />
            </AppLayout>
          }
        />
        <Route
          path="/payslips"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayslipViewPage />
            </AppLayout>
          }
        />
        <Route
          path="/payslips/:employeeId"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayslipViewPage />
            </AppLayout>
          }
        />
        <Route
          path="/payslip"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <PayslipViewPage />
            </AppLayout>
          }
        />
        <Route
          path="/working-schedules"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <WorkingSchedulesPage />
            </AppLayout>
          }
        />
        <Route
          path="/workforce/working-schedules"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <WorkingSchedulesPage />
            </AppLayout>
          }
        />
        <Route
          path="/contracts"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <ContractsPage />
            </AppLayout>
          }
        />
        <Route
          path="/workforce/contracts"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <ContractsPage />
            </AppLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <NotificationsPage />
            </AppLayout>
          }
        />
        <Route
          path="/notifications/activity"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <NotificationsPage />
            </AppLayout>
          }
        />
        <Route
          path="/activity"
          element={
            <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <NotificationsPage />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
