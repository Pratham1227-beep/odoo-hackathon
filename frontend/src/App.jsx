import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import SignupPage from './features/auth/pages/SignupPage';
import LoginPage from './features/auth/pages/LoginPage';
import ChangePasswordPage from './features/auth/pages/ChangePasswordPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import EmployeesPage from './features/employees/pages/EmployeesPage';
import EmployeeProfilePage from './features/employees/pages/EmployeeProfilePage';
import AttendancePage from './features/attendance/pages/AttendancePage';
import TimeOffPage from './features/timeOff/pages/TimeOffPage';
import LeaveRequestPage from './features/leaveRequest/pages/LeaveRequestPage';
import SalarySetupPage from './features/salarySetup/pages/SalarySetupPage';
import AppLayout from './shared/layout/AppLayout';
import ProtectedRoute from './shared/components/ProtectedRoute';
import UnauthorizedPage from './shared/components/UnauthorizedPage';

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
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage isDarkMode={isDarkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/unauthorized"
          element={<UnauthorizedPage isDarkMode={isDarkMode} />}
        />

        {/* Protected Dashboard Routes */}
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
            <ProtectedRoute>
              <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                <EmployeesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:employeeId"
          element={
            <ProtectedRoute>
              <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                <EmployeeProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                <AttendancePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/time-off"
          element={
            <ProtectedRoute>
              <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                <TimeOffPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-request"
          element={
            <ProtectedRoute>
              <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                <LeaveRequestPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-management"
          element={
            <ProtectedRoute>
              <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                <LeaveRequestPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Payroll Route - Only HR and Admin */}
        <Route
          path="/salary-setup"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER']}>
              <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                <SalarySetupPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}