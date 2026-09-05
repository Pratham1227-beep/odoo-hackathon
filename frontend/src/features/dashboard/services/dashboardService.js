import { apiClient } from '../../../shared/api/apiClient';

export const dashboardService = {
  getMainDashboard: async (params = {}) => {
    const response = await apiClient.get('/reports-dashboard', { params });
    return response.data;
  },

  getPayrollDashboard: async (params = {}) => {
    const response = await apiClient.get('/reports-dashboard/payroll', { params });
    return response.data;
  },

  getAttendanceDashboard: async (params = {}) => {
    const response = await apiClient.get('/reports-dashboard/attendance', { params });
    return response.data;
  },

  getEmployeesDashboard: async (params = {}) => {
    const response = await apiClient.get('/reports-dashboard/employees', { params });
    return response.data;
  },

  getAuditLogs: async (params = { page: 1, page_size: 5 }) => {
    const response = await apiClient.get('/audit-logs', { params });
    return response.data;
  },

  getLeaveRequests: async (params = {}) => {
    const response = await apiClient.get('/time-off/requests', { params });
    return response.data;
  },
};
