import { create } from 'zustand';
import { adminSeoService } from '../services/admin/adminService';

const useSeoStore = create((set, get) => ({
  pages: [],
  redirects: [],
  loading: false,

  fetchPages: async () => {
    set({ loading: true });
    try {
      const res = await adminSeoService.getPages();
      set({ pages: res.data?.seo_pages || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createSeoPage: async (data) => {
    const res = await adminSeoService.createPage(data);
    return res.data;
  },

  updateSeoPage: async (id, data) => {
    const res = await adminSeoService.updatePage(id, data);
    return res.data;
  },

  deleteSeoPage: async (id) => {
    await adminSeoService.deletePage(id);
    get().fetchPages();
  },

  fetchRedirects: async () => {
    set({ loading: true });
    try {
      const res = await adminSeoService.getRedirects();
      set({ redirects: res.data?.redirects || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createRedirect: async (data) => {
    const res = await adminSeoService.createRedirect(data);
    return res.data;
  },

  updateRedirect: async (id, data) => {
    const res = await adminSeoService.updateRedirect(id, data);
    return res.data;
  },

  deleteRedirect: async (id) => {
    await adminSeoService.deleteRedirect(id);
    get().fetchRedirects();
  },
}));

export default useSeoStore;
