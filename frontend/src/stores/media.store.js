import { create } from 'zustand';
import { adminMediaService } from '../services/admin/adminService';

const useMediaStore = create((set, get) => ({
  media: [],
  folders: [],
  loading: false,

  fetchMedia: async (params) => {
    set({ loading: true });
    try {
      const res = await adminMediaService.getAll(params);
      set({ media: res.data?.media || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createMedia: async (data) => {
    const res = await adminMediaService.create(data);
    return res.data;
  },

  updateMedia: async (id, data) => {
    const res = await adminMediaService.update(id, data);
    return res.data;
  },

  deleteMedia: async (id) => {
    await adminMediaService.delete(id);
    get().fetchMedia();
  },

  fetchFolders: async () => {
    set({ loading: true });
    try {
      const res = await adminMediaService.getFolders();
      set({ folders: res.data?.folders || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createFolder: async (data) => {
    const res = await adminMediaService.createFolder(data);
    return res.data;
  },

  updateFolder: async (id, data) => {
    const res = await adminMediaService.updateFolder(id, data);
    return res.data;
  },

  deleteFolder: async (id) => {
    await adminMediaService.deleteFolder(id);
    get().fetchFolders();
  },
}));

export default useMediaStore;
