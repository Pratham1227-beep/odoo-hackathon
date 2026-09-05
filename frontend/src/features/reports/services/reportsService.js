import { apiClient } from '../../../shared/api/apiClient';

export const reportsService = {
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

  getSalaryStatement: async (userId, params = {}) => {
    const response = await apiClient.get(`/reports-dashboard/salary-statement/${userId}`, { params });
    return response.data;
  },
};
