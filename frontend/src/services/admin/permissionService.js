import api from '../api';

const permissionService = {
  getAll: () => api.get('/admin/permissions'),
  getGrouped: () => api.get('/admin/permissions/grouped'),
  create: (name) => api.post('/admin/permissions', { name }),
  delete: (id) => api.delete(`/admin/permissions/${id}`),
  assignToRole: (roleId, permissions) =>
    api.post(`/admin/permissions/assign-to-role/${roleId}`, { permissions }),
  assignToUser: (userId, permissions) =>
    api.post(`/admin/permissions/assign-to-user/${userId}`, { permissions }),
};

export default permissionService;
