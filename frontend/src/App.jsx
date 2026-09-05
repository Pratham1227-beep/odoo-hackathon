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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}