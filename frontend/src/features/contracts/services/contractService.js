import { apiClient } from '../../../shared/api/apiClient';

export const contractService = {
  getContracts: async (params = {}) => {
    const response = await apiClient.get('/contracts', { params });
    return response.data;
  },

  getContractById: async (contractId) => {
    const response = await apiClient.get(`/contracts/${contractId}`);
    return response.data;
  },

  createContract: async (data) => {
    const response = await apiClient.post('/contracts', data);
    return response.data;
  },

  updateContract: async (contractId, data) => {
    const response = await apiClient.patch(`/contracts/${contractId}`, data);
    return response.data;
  },
};
