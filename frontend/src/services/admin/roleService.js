import api from '../api';

const roleService = {
  getAll: (params) => api.get('/admin/roles', params),
  getAllSimple: () => api.get('/admin/roles/all'),
  getById: (id) => api.get(`/admin/roles/${id}`),
  create: (data) => api.post('/admin/roles', data),
  update: (id, data) => api.put(`/admin/roles/${id}`, data),
  delete: (id) => api.delete(`/admin/roles/${id}`),
};

export default roleService;
