import { create } from 'zustand';
import { adminCampaignService } from '../services/admin/adminService';

const useCampaignsStore = create((set, get) => ({
  campaigns: [],
  loading: false,
  pagination: null,

  fetchCampaigns: async (params) => {
    set({ loading: true });
    try {
      const res = await adminCampaignService.getAll(params);
      const data = res.data;
      set({
        campaigns: data?.data || data?.campaigns || [],
        pagination: data?.meta || null,
      });
    } catch {} finally { set({ loading: false }); }
  },

  fetchCampaign: async (id) => {
    const res = await adminCampaignService.getById(id);
    return res.data?.campaign;
  },

  createCampaign: async (data) => {
    const res = await adminCampaignService.create(data);
    return res.data;
  },

  updateCampaign: async (id, data) => {
    const res = await adminCampaignService.update(id, data);
    return res.data;
  },

  deleteCampaign: async (id) => {
    await adminCampaignService.delete(id);
    get().fetchCampaigns();
  },
}));

export default useCampaignsStore;
