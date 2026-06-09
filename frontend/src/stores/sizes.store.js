import { create } from 'zustand';
import { adminSizeService } from '../services/admin/adminService';

const useSizesStore = create((set, get) => ({
  sizes: [],
  loading: false,

  fetchSizes: async () => {
    set({ loading: true });
    try {
      const res = await adminSizeService.getAll();
      set({ sizes: res.data?.data?.sizes || res.data?.sizes || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createSize: async (data) => {
    const res = await adminSizeService.create(data);
    return res.data;
  },

  updateSize: async (id, data) => {
    const res = await adminSizeService.update(id, data);
    return res.data;
  },

  deleteSize: async (id) => {
    await adminSizeService.delete(id);
    get().fetchSizes();
  },
}));

export default useSizesStore;
