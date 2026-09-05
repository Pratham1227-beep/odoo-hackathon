import { apiClient } from '../../../shared/api/apiClient';

export const attendanceService = {
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

  getAttendanceSummary: async (params = {}) => {
    const response = await apiClient.get('/attendance/summary', { params });
    return response.data;
  },

  listAttendances: async (params = {}) => {
    const response = await apiClient.get('/attendance', { params });
    return response.data;
  },

  directCorrection: async (attendanceId, data) => {
    const response = await apiClient.patch(`/attendance/${attendanceId}`, data);
    return response.data;
  },

  listCorrections: async (params = {}) => {
    const response = await apiClient.get('/attendance/corrections', { params });
    return response.data;
  },

  reviewCorrection: async (correctionId, data) => {
    const response = await apiClient.patch(`/attendance/corrections/${correctionId}`, data);
    return response.data;
  },

  listHolidays: async (params = {}) => {
    const response = await apiClient.get('/holidays', { params });
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
