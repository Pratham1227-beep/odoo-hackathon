import axios from 'axios';
import { useAuthStore } from '../../../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const employeeService = {
  createEmployee: async (data) => {
    // Map frontend data to backend schema EmployeeCreate
    const payload = {
      first_name: data.name.split(' ')[0] || '',
      last_name: data.name.split(' ').slice(1).join(' ') || '',
      email: data.email,
      phone: data.phone || null,
      user_role: data.user_role,
      create_user_account: true, // We want to provision a user account
      employment_type: "FULL_TIME",
      status: "ACTIVE",
      joining_date: new Date().toISOString().split('T')[0],
    };

    const response = await axios.post(`${API_URL}/employees`, payload, {
      headers: getHeaders(),
    });
    return response.data;
  },
};
