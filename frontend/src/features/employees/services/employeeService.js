import { apiClient } from '../../../shared/api/apiClient';

export const employeeService = {
  getEmployees: async (params = {}) => {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },

  getEmployeeStats: async () => {
    const response = await apiClient.get('/employees/stats/summary');
    return response.data;
  },

  getEmployeeById: async (employeeId) => {
    const response = await apiClient.get(`/employees/${employeeId}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await apiClient.get('/employees/me');
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  updateEmployee: async (employeeId, data) => {
    const response = await apiClient.put(`/employees/${employeeId}`, data);
    return response.data;
  },

  deleteEmployee: async (employeeId, hardDelete = false) => {
    const response = await apiClient.delete(`/employees/${employeeId}`, {
      params: { hard_delete: hardDelete },
    });
    return response.data;
  },

  getDocuments: async (employeeId) => {
    const response = await apiClient.get(`/employees/${employeeId}/documents`);
    return response.data;
  },

  addDocument: async (employeeId, data) => {
    const response = await apiClient.post(`/employees/${employeeId}/documents`, data);
    return response.data;
  },

  upsertBankAccount: async (employeeId, data) => {
    const response = await apiClient.post(`/employees/${employeeId}/bank-account`, data);
    return response.data;
  },
};
