import { apiClient } from '../../../shared/api/apiClient';

export const payrollConfigService = {
  // Salary Structures
  listStructures: async (params = {}) => {
    const response = await apiClient.get('/salary-structures', { params });
    return response.data;
  },

  createStructure: async (data) => {
    const response = await apiClient.post('/salary-structures', data);
    return response.data;
  },

  getStructureDetail: async (structureId) => {
    const response = await apiClient.get(`/salary-structures/${structureId}`);
    return response.data;
  },

  updateStructure: async (structureId, data) => {
    const response = await apiClient.patch(`/salary-structures/${structureId}`, data);
    return response.data;
  },

  replaceStructureRules: async (structureId, data) => {
    const response = await apiClient.patch(`/salary-structures/${structureId}/rules`, data);
    return response.data;
  },

  // Salary Rules
  listRules: async (params = {}) => {
    const response = await apiClient.get('/salary-rules', { params });
    return response.data;
  },

  createRule: async (data) => {
    const response = await apiClient.post('/salary-rules', data);
    return response.data;
  },

  getRule: async (ruleId) => {
    const response = await apiClient.get(`/salary-rules/${ruleId}`);
    return response.data;
  },

  updateRule: async (ruleId, data) => {
    const response = await apiClient.patch(`/salary-rules/${ruleId}`, data);
    return response.data;
  },

  // Company Payroll Configuration
  getCompanyPayrollConfig: async () => {
    const response = await apiClient.get('/payroll-config');
    return response.data;
  },

  updateCompanyPayrollConfig: async (data) => {
    const response = await apiClient.patch('/payroll-config', data);
    return response.data;
  },
};
