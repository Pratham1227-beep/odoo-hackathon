import { apiClient } from '../../../shared/api/apiClient';

const buildParams = (params = {}) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

export const payrollService = {
  getDashboard: async () => {
    const response = await apiClient.get('/payroll/dashboard');
    return response.data;
  },

  listPayruns: async (params = {}) => {
    const response = await apiClient.get('/payroll/payruns', {
      params: buildParams(params),
    });
    return response.data;
  },

  createPayrun: async (payload) => {
    const response = await apiClient.post('/payroll/payruns', payload);
    return response.data;
  },

  getPayrun: async (payrunId) => {
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
    const response = await apiClient.get('/payroll/payslips', {
      params: buildParams(params),
    });
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
    const disposition = response.headers?.['content-disposition'] || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] || `payslip-${payslipId}.pdf`;
    return { blob: response.data, filename };
  },
};
