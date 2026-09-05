import { apiClient } from '../../../shared/api/apiClient';

export const payrunService = {
  getPayrollDashboard: async () => {
    const response = await apiClient.get('/payroll/dashboard');
    return response.data;
  },

  listPayruns: async (params = {}) => {
    const response = await apiClient.get('/payroll/payruns', { params });
    return response.data;
  },

  createPayrun: async (data) => {
    const response = await apiClient.post('/payroll/payruns', data);
    return response.data;
  },

  getPayrunDetail: async (payrunId) => {
    const response = await apiClient.get(`/payroll/payruns/${payrunId}`);
    return response.data;
  },

  processPayrun: async (payrunId) => {
    const response = await apiClient.post(`/payroll/payruns/${payrunId}/process`);
    return response.data;
  },

  finalizePayrun: async (payrunId) => {
    const response = await apiClient.post(`/payroll/payruns/${payrunId}/finalize`);
    return response.data;
  },

  emailPayrun: async (payrunId) => {
    const response = await apiClient.post(`/payroll/payruns/${payrunId}/email`);
    return response.data;
  },

  listPayslips: async (params = {}) => {
    const response = await apiClient.get('/payroll/payslips', { params });
    return response.data;
  },

  getPayslip: async (payslipId) => {
    const response = await apiClient.get(`/payroll/payslips/${payslipId}`);
    return response.data;
  },

  downloadPayslipPdf: async (payslipId) => {
    const response = await apiClient.get(`/payroll/payslips/${payslipId}`, {
      params: { format: 'pdf' },
      responseType: 'blob',
    });
    return response.data;
  },
};
