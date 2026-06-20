import { create } from 'zustand';
import { adminAnnouncementService } from '../services/admin/adminService';

const useAnnouncementsStore = create((set, get) => ({
  bars: [],
  loading: false,

  fetchBars: async () => {
    set({ loading: true });
    try {
      const res = await adminAnnouncementService.getAll();
      set({ bars: res.data?.bars || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchBar: async (id) => {
    const res = await adminAnnouncementService.getById(id);
    return res.data?.bar;
  },

  createBar: async (data) => {
    const res = await adminAnnouncementService.create(data);
    return res.data;
  },

  updateBar: async (id, data) => {
    const res = await adminAnnouncementService.update(id, data);
    return res.data;
  },

  deleteBar: async (id) => {
    await adminAnnouncementService.delete(id);
    get().fetchBars();
  },
}));

export default useAnnouncementsStore;
