import { create } from 'zustand';
import api from '../services/api';

const useReviewsStore = create((set) => ({
  reviews: [],
  loading: false,
  pagination: { total: 0, page: 1, per_page: 20, last_page: 1 },

  fetchReviews: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/reviews', params);
      const data = res.data;
      set({
        reviews: data?.reviews?.data || data?.reviews || [],
        pagination: data?.meta
          ? { total: data.meta.total, page: data.meta.page, per_page: data.meta.per_page, last_page: data.meta.last_page }
          : { total: 0, page: 1, per_page: 20, last_page: 1 },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  approveReview: async (id) => {
    const res = await api.put(`/admin/reviews/${id}/approve`);
    return res.data?.review;
  },

  rejectReview: async (id) => {
    const res = await api.put(`/admin/reviews/${id}/reject`);
    return res.data?.review;
  },

  deleteReview: async (id) => {
    await api.delete(`/admin/reviews/${id}`);
  },
}));

export default useReviewsStore;
