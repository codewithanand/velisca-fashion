import { create } from 'zustand';
import { adminAttributeService, adminAttributeValueService } from '../services/admin/adminService';

const useAttributesStore = create((set, get) => ({
  attributes: [],
  attributeValues: [],
  loading: false,

  fetchAttributes: async (params) => {
    set({ loading: true });
    try {
      const res = await adminAttributeService.getAll(params);
      set({ attributes: res.data?.attributes || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchAttribute: async (id) => {
    const res = await adminAttributeService.getById(id);
    return res.data?.attribute;
  },

  createAttribute: async (data) => {
    const res = await adminAttributeService.create(data);
    return res.data;
  },

  updateAttribute: async (id, data) => {
    const res = await adminAttributeService.update(id, data);
    return res.data;
  },

  deleteAttribute: async (id) => {
    await adminAttributeService.delete(id);
    get().fetchAttributes();
  },

  fetchAttributeValues: async (params) => {
    set({ loading: true });
    try {
      const res = await adminAttributeValueService.getAll(params);
      set({ attributeValues: res.data?.attribute_values || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createAttributeValue: async (data) => {
    const res = await adminAttributeValueService.create(data);
    return res.data;
  },

  updateAttributeValue: async (id, data) => {
    const res = await adminAttributeValueService.update(id, data);
    return res.data;
  },

  deleteAttributeValue: async (id) => {
    await adminAttributeValueService.delete(id);
    get().fetchAttributeValues();
  },
}));

export default useAttributesStore;
