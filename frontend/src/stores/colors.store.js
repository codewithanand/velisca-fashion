import { create } from 'zustand';
import { adminColorService } from '../services/admin/adminService';

const useColorsStore = create((set, get) => ({
  colors: [],
  loading: false,

  fetchColors: async () => {
    set({ loading: true });
    try {
      const res = await adminColorService.getAll();
      set({ colors: res.data?.data?.colors || res.data?.colors || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createColor: async (data) => {
    const res = await adminColorService.create(data);
    return res.data;
  },

  updateColor: async (id, data) => {
    const res = await adminColorService.update(id, data);
    return res.data;
  },

  deleteColor: async (id) => {
    await adminColorService.delete(id);
    get().fetchColors();
  },
}));

export default useColorsStore;
