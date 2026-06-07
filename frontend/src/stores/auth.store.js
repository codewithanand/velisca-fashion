import { create } from 'zustand';
import api, { setAccessToken, setRefreshToken, clearAuth } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('admin') || 'null'),
  permissions: [],
  loading: false,

  setUser: (user) => {
    localStorage.setItem('admin', JSON.stringify(user));
    set({ user });
  },

  setPermissions: (permissions) => set({ permissions }),

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', { email, password, device_name: 'admin-panel' });
      const { user, access_token, refresh_token } = res.data;
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      localStorage.setItem('admin', JSON.stringify(user));
      set({ user, loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    clearAuth();
    localStorage.removeItem('admin');
    set({ user: null, permissions: [] });
  },

  fetchPermissions: async () => {
    try {
      const res = await api.get('/admin/me');
      if (res.data?.user) {
        const user = res.data.user;
        set({ permissions: user.permissions || [] });
      }
    } catch {
      // ignore
    }
  },

  hasPermission: (permission) => {
    const { permissions, user } = get();
    if (user?.role === 'admin') return true;
    return permissions.some((p) => p.name === permission || p === permission);
  },

  hasRole: (role) => {
    const { user } = get();
    return user?.role === role;
  },

  hasAnyRole: (roles) => {
    const { user } = get();
    return roles.includes(user?.role);
  },
}));

export default useAuthStore;
