import { create } from 'zustand';
import api from '../services/api';

const useCategoriesStore = create((set) => ({
  categories: [],
  loading: false,

  fetchCategories: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/categories', params);
      set({ categories: res.data?.categories || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCategory: async (id) => {
    const res = await api.get(`/admin/categories/${id}`);
    return res.data?.category;
  },

  createCategory: async (data) => {
    const res = await api.post('/admin/categories', data);
    return res.data?.category;
  },

  updateCategory: async (id, data) => {
    const res = await api.put(`/admin/categories/${id}`, data);
    return res.data?.category;
  },

  deleteCategory: async (id) => {
    await api.delete(`/admin/categories/${id}`);
  },
}));

export default useCategoriesStore;
