import { create } from 'zustand';
import api from '../services/api';

const useUsersStore = create((set) => ({
  users: [],
  loading: false,
  pagination: { total: 0, page: 1, per_page: 20, last_page: 1 },

  fetchUsers: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/users', params);
      const userData = res.data?.users;
      set({
        users: userData?.data || userData || [],
        pagination: userData?.data
          ? { total: userData.total, page: userData.current_page, per_page: userData.per_page, last_page: userData.last_page }
          : { total: 0, page: 1, per_page: 20, last_page: 1 },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  fetchUser: async (id) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data?.user;
  },

  createUser: async (data) => {
    const res = await api.post('/admin/users', data);
    return res.data?.user;
  },

  updateUser: async (id, data) => {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data?.user;
  },

  deleteUser: async (id) => {
    await api.delete(`/admin/users/${id}`);
  },

  toggleBlock: async (id) => {
    const res = await api.put(`/admin/users/${id}/toggle-block`);
    return res.data?.user;
  },

  assignRoles: async (id, roles) => {
    const res = await api.post(`/admin/users/${id}/roles`, { roles });
    return res.data?.user;
  },
}));

export default useUsersStore;
