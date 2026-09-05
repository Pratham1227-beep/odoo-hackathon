import { apiClient } from '../api/apiClient';

export const organizationService = {
  getCurrentOrganization: async () => {
    const response = await apiClient.get('/organization/current');
    return response.data;
  },

  updateCurrentOrganization: async (data) => {
    const response = await apiClient.put('/organization/current', data);
    return response.data;
  },

  getDepartments: async (params = {}) => {
    const response = await apiClient.get('/departments', { params });
    return response.data;
  },

  getDepartmentTree: async () => {
    const response = await apiClient.get('/departments/tree');
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await apiClient.post('/departments', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await apiClient.put(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  },

  getDesignations: async (params = {}) => {
    const response = await apiClient.get('/designations', { params });
    return response.data;
  },

  createDesignation: async (data) => {
    const response = await apiClient.post('/designations', data);
    return response.data;
  },

  updateDesignation: async (id, data) => {
    const response = await apiClient.put(`/designations/${id}`, data);
    return response.data;
  },

  deleteDesignation: async (id) => {
    const response = await apiClient.delete(`/designations/${id}`);
    return response.data;
  },

  getWorkLocations: async (params = {}) => {
    const response = await apiClient.get('/work-locations', { params });
    return response.data;
  },

  createWorkLocation: async (data) => {
    const response = await apiClient.post('/work-locations', data);
    return response.data;
  },

  updateWorkLocation: async (id, data) => {
    const response = await apiClient.put(`/work-locations/${id}`, data);
    return response.data;
  },

  deleteWorkLocation: async (id) => {
    const response = await apiClient.delete(`/work-locations/${id}`);
    return response.data;
  },
};
