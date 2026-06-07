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
      const data = res.data;
      set({
        roles: data?.roles?.data || data?.roles || [],
        pagination: data?.meta
          ? { total: data.meta.total, page: data.meta.page, per_page: data.meta.per_page, last_page: data.meta.last_page }
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
