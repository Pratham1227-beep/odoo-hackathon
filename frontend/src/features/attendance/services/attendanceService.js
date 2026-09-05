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

export const attendanceService = {
  getToday: async () => {
    const response = await apiClient.get('/attendance/today');
    return response.data;
  },

  clockIn: async () => {
    const response = await apiClient.post('/attendance/clock-in');
    return response.data;
  },

  clockOut: async () => {
    const response = await apiClient.post('/attendance/clock-out');
    return response.data;
  },

  listAttendances: async (params = {}) => {
    const response = await apiClient.get('/attendance', {
      params: buildParams(params),
    });
    return response.data;
  },

  getSummary: async (params = {}) => {
    const response = await apiClient.get('/attendance/summary', {
      params: buildParams(params),
    });
    return response.data;
  },

  upsertAttendance: async (payload) => {
    const response = await apiClient.post('/attendance', payload);
    return response.data;
  },

  updateAttendance: async (attendanceId, payload) => {
    const response = await apiClient.patch(`/attendance/${attendanceId}`, payload);
    return response.data;
  },

  requestCorrection: async (attendanceId, payload) => {
    const response = await apiClient.post(
      `/attendance/${attendanceId}/corrections`,
      payload
    );
    return response.data;
  },

  listCorrections: async (params = {}) => {
    const response = await apiClient.get('/attendance/corrections', {
      params: buildParams(params),
    });
    return response.data;
  },

  reviewCorrection: async (correctionId, payload) => {
    const response = await apiClient.patch(
      `/attendance/corrections/${correctionId}`,
      payload
    );
    return response.data;
  },

  listHolidays: async (year) => {
    const response = await apiClient.get('/holidays', {
      params: buildParams({ year }),
    });
    return response.data;
  },
};
