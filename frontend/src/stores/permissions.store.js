import { create } from 'zustand';
import api from '../services/api';

const usePermissionsStore = create((set) => ({
  permissions: [],
  groupedPermissions: {},
  loading: false,

  fetchPermissions: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/permissions');
      set({ permissions: res.data?.permissions || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchGroupedPermissions: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/permissions/grouped');
      set({ groupedPermissions: res.data?.groups || {}, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createPermission: async (name) => {
    const res = await api.post('/admin/permissions', { name });
    return res.data?.permission;
  },

  deletePermission: async (id) => {
    await api.delete(`/admin/permissions/${id}`);
  },

  assignToRole: async (roleId, permissions) => {
    const res = await api.post(`/admin/permissions/assign-to-role/${roleId}`, { permissions });
    return res.data?.role;
  },

  assignToUser: async (userId, permissions) => {
    const res = await api.post(`/admin/permissions/assign-to-user/${userId}`, { permissions });
    return res.data?.user;
  },
}));

export default usePermissionsStore;
