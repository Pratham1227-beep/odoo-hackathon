import { apiClient } from '../../../shared/api/apiClient';

export const settingsService = {
  getOrganization: async () => {
    const response = await apiClient.get('/organization/current');
    return response.data;
  },

  updateOrganization: async (data) => {
    const response = await apiClient.put('/organization/current', data);
    return response.data;
  },

  getPayrollConfig: async () => {
    const response = await apiClient.get('/payroll-config');
    return response.data;
  },

  updatePayrollConfig: async (data) => {
    const response = await apiClient.patch('/payroll-config', data);
    return response.data;
  },
};
