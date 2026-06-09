import { create } from 'zustand';
import { adminReviewStatusService } from '../services/admin/adminService';

const useReviewStatusesStore = create((set, get) => ({
  reviewStatuses: [],
  loading: false,

  fetchReviewStatuses: async () => {
    set({ loading: true });
    try {
      const res = await adminReviewStatusService.getAll();
      set({ reviewStatuses: res.data?.review_statuses || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createReviewStatus: async (data) => {
    const res = await adminReviewStatusService.create(data);
    return res.data;
  },

  updateReviewStatus: async (id, data) => {
    const res = await adminReviewStatusService.update(id, data);
    return res.data;
  },

  deleteReviewStatus: async (id) => {
    await adminReviewStatusService.delete(id);
    get().fetchReviewStatuses();
  },
}));

export default useReviewStatusesStore;
