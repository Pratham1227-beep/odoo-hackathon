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

export const timeOffService = {
  // ==========================================
  // Leave Types API
  // ==========================================
  listLeaveTypes: async (isActive = null) => {
    const response = await apiClient.get('/time-off/types', {
      params: buildParams({ is_active: isActive }),
    });
    return response.data;
  },

  createLeaveType: async (payload) => {
    const response = await apiClient.post('/time-off/types', payload);
    return response.data;
  },

  // ==========================================
  // Leave Allocations API
  // ==========================================
  listAllocations: async (params = {}) => {
    const response = await apiClient.get('/time-off/allocations', {
      params: buildParams(params),
    });
    return response.data;
  },

  createAllocation: async (payload) => {
    const response = await apiClient.post('/time-off/allocations', payload);
    return response.data;
  },

  // ==========================================
  // Leave Requests API
  // ==========================================
  listRequests: async (params = {}) => {
    const response = await apiClient.get('/time-off/requests', {
      params: buildParams(params),
    });
    return response.data;
  },

  createRequest: async (payload) => {
    const response = await apiClient.post('/time-off/requests', payload);
    return response.data;
  },

  reviewRequest: async (requestId, payload) => {
    const response = await apiClient.patch(`/time-off/requests/${requestId}`, payload);
    return response.data;
  },

  // ==========================================
  // Holidays API
  // ==========================================
  listHolidays: async (year = null) => {
    const response = await apiClient.get('/holidays', {
      params: buildParams({ year }),
    });
    return response.data;
  },
};
