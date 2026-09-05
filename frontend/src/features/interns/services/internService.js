import { apiClient } from '../../../shared/api/apiClient';

export const internService = {
  getInterns: async (params = {}) => {
    const response = await apiClient.get('/interns', {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 50,
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.department_id ? { department_id: params.department_id } : {}),
        ...(params.mentor_id ? { mentor_id: params.mentor_id } : {}),
      },
    });
    return response.data;
  },

  getInternStats: async () => {
    const response = await apiClient.get('/interns/stats');
    return response.data;
  },

  getInternById: async (internId) => {
    const response = await apiClient.get(`/interns/${internId}`);
    return response.data;
  },

  createIntern: async (data) => {
    const response = await apiClient.post('/interns', data);
    return response.data;
  },

  updateIntern: async (internId, data) => {
    const response = await apiClient.put(`/interns/${internId}`, data);
    return response.data;
  },

  updateStatus: async (internId, status) => {
    const response = await apiClient.patch(`/interns/${internId}/status`, { status });
    return response.data;
  },

  updateMentor: async (internId, mentorId) => {
    const response = await apiClient.patch(`/interns/${internId}/mentor`, { mentor_id: mentorId });
    return response.data;
  },

  // Goals
  createGoal: async (internId, goalData) => {
    const response = await apiClient.post(`/interns/${internId}/goals`, goalData);
    return response.data;
  },

  updateGoal: async (internId, goalId, goalData) => {
    const response = await apiClient.put(`/interns/${internId}/goals/${goalId}`, goalData);
    return response.data;
  },

  deleteGoal: async (internId, goalId) => {
    const response = await apiClient.delete(`/interns/${internId}/goals/${goalId}`);
    return response.data;
  },

  // Reviews
  createReview: async (internId, reviewData) => {
    const response = await apiClient.post(`/interns/${internId}/reviews`, reviewData);
    return response.data;
  },

  // Completion & Conversion
  completeInternship: async (internId) => {
    const response = await apiClient.post(`/interns/${internId}/complete`);
    return response.data;
  },

  convertIntern: async (internId) => {
    const response = await apiClient.post(`/interns/${internId}/convert`);
    return response.data;
  },

  generateCertificateUrl: (internId) => {
    const baseURL = apiClient.defaults.baseURL || '/api/v1';
    return `${baseURL}/interns/${internId}/certificate`;
  },
};
