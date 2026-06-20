import { create } from 'zustand';
import { adminCmsPageService } from '../services/admin/adminService';

const useCmsPagesStore = create((set, get) => ({
  pages: [],
  loading: false,
  pagination: null,

  fetchPages: async (params) => {
    set({ loading: true });
    try {
      const res = await adminCmsPageService.getAll(params);
      const data = res.data;
      set({
        pages: data?.data || data?.pages || [],
        pagination: data?.meta || null,
      });
    } catch {} finally { set({ loading: false }); }
  },

  fetchPage: async (id) => {
    const res = await adminCmsPageService.getById(id);
    return res.data?.page;
  },

  createPage: async (data) => {
    const res = await adminCmsPageService.create(data);
    return res.data;
  },

  updatePage: async (id, data) => {
    const res = await adminCmsPageService.update(id, data);
    return res.data;
  },

  deletePage: async (id) => {
    await adminCmsPageService.delete(id);
    get().fetchPages();
  },
}));

export default useCmsPagesStore;
