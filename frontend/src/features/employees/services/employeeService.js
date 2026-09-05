import { apiClient } from '../../../shared/api/apiClient';

export const employeeService = {
  getEmployees: async (params = {}) => {
    const response = await apiClient.get('/employees', {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 100,
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.department_id ? { department_id: params.department_id } : {}),
      },
    });
    return response.data;
  },

  listEmployees: async (params = {}) => {
    const response = await apiClient.get('/employees', {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 100,
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.department_id ? { department_id: params.department_id } : {}),
      },
    });
    return response.data;
  },

  getEmployeeStats: async () => {
    const response = await apiClient.get('/employees/stats/summary');
    return response.data;
  },

  getEmployeeById: async (employeeId) => {
    const response = await apiClient.get(`/employees/${employeeId}`);
    return response.data;
  },

  getEmployee: async (employeeId) => {
    const response = await apiClient.get(`/employees/${employeeId}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await apiClient.get('/employees/me');
    return response.data;
  },

  getMyEmployee: async () => {
    const response = await apiClient.get('/employees/me');
    return response.data;
  },

  createEmployee: async (data) => {
    let payload = data;
    if (data.name && !data.first_name) {
      payload = {
        first_name: data.name.split(' ')[0] || '',
        last_name: data.name.split(' ').slice(1).join(' ') || '',
        email: data.email,
        phone: data.phone || null,
        user_role: data.user_role,
        create_user_account: true,
        employment_type: 'FULL_TIME',
        status: 'ACTIVE',
        joining_date: new Date().toISOString().split('T')[0],
      };
    }
    const response = await apiClient.post('/employees', payload);
    return response.data;
  },

  updateEmployee: async (employeeId, data) => {
    const response = await apiClient.put(`/employees/${employeeId}`, data);
    return response.data;
  },

  deleteEmployee: async (employeeId, hardDelete = false) => {
    const response = await apiClient.delete(`/employees/${employeeId}`, {
      params: { hard_delete: hardDelete },
    });
    return response.data;
  },

  listAllActiveEmployees: async () => {
    const pageSize = 100;
    let page = 1;
    let all = [];
    let totalPages = 1;

    do {
      const data = await employeeService.listEmployees({
        page,
        page_size: pageSize,
        status: 'ACTIVE',
      });
      all = all.concat(data.items || []);
      totalPages = data.total_pages || 1;
      page += 1;
    } while (page <= totalPages && page <= 20);

    return all;
  },

  getDocuments: async (employeeId) => {
    const response = await apiClient.get(`/employees/${employeeId}/documents`);
    return response.data;
  },

  addDocument: async (employeeId, data) => {
    const response = await apiClient.post(`/employees/${employeeId}/documents`, data);
    return response.data;
  },

  upsertBankAccount: async (employeeId, data) => {
    const response = await apiClient.post(`/employees/${employeeId}/bank-account`, data);
    return response.data;
  },
};
