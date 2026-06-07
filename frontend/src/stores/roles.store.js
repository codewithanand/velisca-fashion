import { create } from 'zustand';
import api from '../services/api';

const useRolesStore = create((set) => ({
  roles: [],
  loading: false,
  pagination: { total: 0, page: 1, per_page: 20, last_page: 1 },

  fetchRoles: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/roles', params);
      const roleData = res.data?.roles;
      set({
        roles: roleData?.data || roleData || [],
        pagination: roleData?.data
          ? { total: roleData.total, page: roleData.current_page, per_page: roleData.per_page, last_page: roleData.last_page }
          : { total: 0, page: 1, per_page: 20, last_page: 1 },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  fetchAllRoles: async () => {
    const res = await api.get('/admin/roles/all');
    return res.data?.roles || [];
  },

  fetchRole: async (id) => {
    const res = await api.get(`/admin/roles/${id}`);
    return res.data?.role;
  },

  createRole: async (data) => {
    const res = await api.post('/admin/roles', data);
    return res.data?.role;
  },

  updateRole: async (id, data) => {
    const res = await api.put(`/admin/roles/${id}`, data);
    return res.data?.role;
  },

  deleteRole: async (id) => {
    await api.delete(`/admin/roles/${id}`);
  },
}));

export default useRolesStore;
