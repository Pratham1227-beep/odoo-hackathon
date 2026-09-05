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

  getTodayAttendance: async () => {
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

  getAttendanceSummary: async (params = {}) => {
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

  directCorrection: async (attendanceId, data) => {
    const response = await apiClient.patch(`/attendance/${attendanceId}`, data);
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

  listHolidays: async (paramsOrYear = null) => {
    const params = typeof paramsOrYear === 'number' || typeof paramsOrYear === 'string'
      ? { year: paramsOrYear }
      : (paramsOrYear || {});
    const response = await apiClient.get('/holidays', {
      params: buildParams(params),
    });
    return response.data;
  },

  createHoliday: async (data) => {
    const response = await apiClient.post('/holidays', data);
    return response.data;
  },

  updateHoliday: async (holidayId, data) => {
    const response = await apiClient.patch(`/holidays/${holidayId}`, data);
    return response.data;
  },
};
