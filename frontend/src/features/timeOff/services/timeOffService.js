import { apiClient } from '../../../shared/api/apiClient';

export const timeOffService = {
  getLeaveTypes: async (params = {}) => {
    const response = await apiClient.get('/time-off/types', { params });
    return response.data;
  },

  createLeaveType: async (data) => {
    const response = await apiClient.post('/time-off/types', data);
    return response.data;
  },

  getAllocations: async (params = {}) => {
    const response = await apiClient.get('/time-off/allocations', { params });
    return response.data;
  },

  createAllocation: async (data) => {
    const response = await apiClient.post('/time-off/allocations', data);
    return response.data;
  },

  getRequests: async (params = {}) => {
    const response = await apiClient.get('/time-off/requests', { params });
    return response.data;
  },

  createRequest: async (data) => {
    const response = await apiClient.post('/time-off/requests', data);
    return response.data;
  },

  reviewRequest: async (requestId, data) => {
    const response = await apiClient.patch(`/time-off/requests/${requestId}`, data);
    return response.data;
  },
};
