import { create } from 'zustand';
import { adminPopupService } from '../services/admin/adminService';

const usePopupsStore = create((set, get) => ({
  popups: [],
  loading: false,

  fetchPopups: async () => {
    set({ loading: true });
    try {
      const res = await adminPopupService.getAll();
      set({ popups: res.data?.popups || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchPopup: async (id) => {
    const res = await adminPopupService.getById(id);
    return res.data?.popup;
  },

  createPopup: async (data) => {
    const res = await adminPopupService.create(data);
    return res.data;
  },

  updatePopup: async (id, data) => {
    const res = await adminPopupService.update(id, data);
    return res.data;
  },

  deletePopup: async (id) => {
    await adminPopupService.delete(id);
    get().fetchPopups();
  },
}));

export default usePopupsStore;
