import { apiClient } from '../../../shared/api/apiClient';

export const employeeService = {
  createEmployee: async (data) => {
    const payload = {
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

    const response = await apiClient.post('/employees', payload);
    return response.data;
  },

  getMyEmployee: async () => {
    const response = await apiClient.get('/employees/me');
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

  getEmployee: async (employeeId) => {
    const response = await apiClient.get(`/employees/${employeeId}`);
    return response.data;
  },

  /** Fetch all pages up to a reasonable cap for day-sheet views */
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
};
