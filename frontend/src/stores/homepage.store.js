import { create } from 'zustand';
import { adminHomepageService } from '../services/admin/adminService';

const useHomepageStore = create((set, get) => ({
  layout: null,
  layouts: [],
  sections: [],
  loading: false,

  fetchLayout: async () => {
    set({ loading: true });
    try {
      const res = await adminHomepageService.getLayout();
      set({ layout: res.data?.layout || null });
    } catch {} finally { set({ loading: false }); }
  },

  fetchLayouts: async () => {
    try {
      const res = await adminHomepageService.getLayouts();
      set({ layouts: res.data?.layouts || [] });
    } catch {}
  },

  fetchSections: async (params) => {
    set({ loading: true });
    try {
      const res = await adminHomepageService.getSections(params);
      set({ sections: res.data?.sections || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createLayout: async (data) => {
    const res = await adminHomepageService.createLayout(data);
    return res.data;
  },

  updateLayout: async (id, data) => {
    const res = await adminHomepageService.updateLayout(id, data);
    return res.data;
  },

  deleteLayout: async (id) => {
    await adminHomepageService.deleteLayout(id);
    get().fetchLayouts();
  },

  createSection: async (data) => {
    const res = await adminHomepageService.createSection(data);
    return res.data;
  },

  updateSection: async (id, data) => {
    const res = await adminHomepageService.updateSection(id, data);
    return res.data;
  },

  deleteSection: async (id) => {
    await adminHomepageService.deleteSection(id);
    get().fetchSections();
  },

  reorderSections: async (sections) => {
    const res = await adminHomepageService.reorderSections({ sections });
    return res.data;
  },

  createSectionItem: async (data) => {
    const res = await adminHomepageService.createSectionItem(data);
    return res.data;
  },

  updateSectionItem: async (id, data) => {
    const res = await adminHomepageService.updateSectionItem(id, data);
    return res.data;
  },

  deleteSectionItem: async (id) => {
    await adminHomepageService.deleteSectionItem(id);
    await get().fetchSections();
  },
}));

export default useHomepageStore;
