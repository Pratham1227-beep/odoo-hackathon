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

export const salarySetupService = {
  // ==========================================
  // Salary Structures
  // ==========================================
  listStructures: async (params = {}) => {
    const response = await apiClient.get('/salary-structures', {
      params: buildParams(params),
    });
    return response.data;
  },

  createStructure: async (payload) => {
    const response = await apiClient.post('/salary-structures', payload);
    return response.data;
  },

  getStructureDetail: async (structureId) => {
    const response = await apiClient.get(`/salary-structures/${structureId}`);
    return response.data;
  },

  updateStructure: async (structureId, payload) => {
    const response = await apiClient.patch(`/salary-structures/${structureId}`, payload);
    return response.data;
  },

  replaceStructureRules: async (structureId, rules) => {
    const response = await apiClient.patch(`/salary-structures/${structureId}/rules`, {
      rules,
    });
    return response.data;
  },

  // ==========================================
  // Salary Rules
  // ==========================================
  listRules: async (params = {}) => {
    const response = await apiClient.get('/salary-rules', {
      params: buildParams(params),
    });
    return response.data;
  },

  createRule: async (payload) => {
    const response = await apiClient.post('/salary-rules', payload);
    return response.data;
  },

  getRule: async (ruleId) => {
    const response = await apiClient.get(`/salary-rules/${ruleId}`);
    return response.data;
  },

  updateRule: async (ruleId, payload) => {
    const response = await apiClient.patch(`/salary-rules/${ruleId}`, payload);
    return response.data;
  },

  // ==========================================
  // Company Statutory Payroll Configuration
  // ==========================================
  getCompanyConfig: async () => {
    const response = await apiClient.get('/payroll-config');
    return response.data;
  },

  updateCompanyConfig: async (payload) => {
    const response = await apiClient.patch('/payroll-config', payload);
    return response.data;
  },

  // ==========================================
  // Employee Salary Component Overrides
  // ==========================================
  getEmployeeSalaryComponents: async (userOrEmployeeId) => {
    const response = await apiClient.get(`/payroll-config/salary/${userOrEmployeeId}`);
    return response.data;
  },

  updateEmployeeSalaryComponents: async (userOrEmployeeId, components) => {
    const response = await apiClient.patch(`/payroll-config/salary/${userOrEmployeeId}`, {
      components,
    });
    return response.data;
  },
};
