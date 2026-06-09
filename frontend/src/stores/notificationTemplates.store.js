import { create } from 'zustand';
import { adminNotificationTemplateService } from '../services/admin/adminService';

const useNotificationTemplatesStore = create((set, get) => ({
  templates: [],
  loading: false,

  fetchTemplates: async () => {
    set({ loading: true });
    try {
      const res = await adminNotificationTemplateService.getAll();
      set({ templates: res.data?.templates || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchTemplate: async (id) => {
    const res = await adminNotificationTemplateService.getById(id);
    return res.data?.template;
  },

  createTemplate: async (data) => {
    const res = await adminNotificationTemplateService.create(data);
    return res.data;
  },

  updateTemplate: async (id, data) => {
    const res = await adminNotificationTemplateService.update(id, data);
    return res.data;
  },

  deleteTemplate: async (id) => {
    await adminNotificationTemplateService.delete(id);
    get().fetchTemplates();
  },
}));

export default useNotificationTemplatesStore;
