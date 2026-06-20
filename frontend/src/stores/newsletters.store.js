import { create } from 'zustand';
import { adminNewsletterService } from '../services/admin/adminService';

const useNewslettersStore = create((set, get) => ({
  subscribers: [],
  loading: false,
  pagination: null,

  fetchSubscribers: async (params) => {
    set({ loading: true });
    try {
      const res = await adminNewsletterService.getAll(params);
      const data = res.data;
      set({
        subscribers: data?.data || data?.newsletters || [],
        pagination: data?.meta || null,
      });
    } catch {} finally { set({ loading: false }); }
  },

  createSubscriber: async (data) => {
    const res = await adminNewsletterService.create(data);
    return res.data;
  },

  updateSubscriber: async (id, data) => {
    const res = await adminNewsletterService.update(id, data);
    return res.data;
  },

  deleteSubscriber: async (id) => {
    await adminNewsletterService.delete(id);
    get().fetchSubscribers();
  },

  exportEmails: async () => {
    const res = await adminNewsletterService.export();
    return res.data?.emails || [];
  },
}));

export default useNewslettersStore;
