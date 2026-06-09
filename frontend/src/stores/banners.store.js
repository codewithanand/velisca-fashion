import { create } from 'zustand';
import { adminBannerService } from '../services/admin/adminService';

const useBannersStore = create((set, get) => ({
  banners: [],
  loading: false,

  fetchBanners: async () => {
    set({ loading: true });
    try {
      const res = await adminBannerService.getAll();
      set({ banners: res.data?.banners || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchBanner: async (id) => {
    const res = await adminBannerService.getById(id);
    return res.data?.banner;
  },

  createBanner: async (data) => {
    const res = await adminBannerService.create(data);
    return res.data;
  },

  updateBanner: async (id, data) => {
    const res = await adminBannerService.update(id, data);
    return res.data;
  },

  deleteBanner: async (id) => {
    await adminBannerService.delete(id);
    get().fetchBanners();
  },

  toggleBanner: async (id) => {
    const res = await adminBannerService.toggle(id);
    return res.data;
  },
}));

export default useBannersStore;
