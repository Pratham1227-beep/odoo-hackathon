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

export const contractService = {
  listContracts: async (params = {}) => {
    const response = await apiClient.get('/contracts', {
      params: buildParams(params),
    });
    return response.data;
  },

  createContract: async (payload) => {
    const response = await apiClient.post('/contracts', payload);
    return response.data;
  },

  getContract: async (contractId) => {
    const response = await apiClient.get(`/contracts/${contractId}`);
    return response.data;
  },

  updateContract: async (contractId, payload) => {
    const response = await apiClient.patch(`/contracts/${contractId}`, payload);
    return response.data;
  },
};
