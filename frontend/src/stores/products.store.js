import { create } from 'zustand';
import api from '../services/api';

const useProductsStore = create((set) => ({
  products: [],
  loading: false,
  pagination: { total: 0, page: 1, per_page: 20, last_page: 1 },

  fetchProducts: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/products', params);
      const data = res.data;
      set({
        products: data?.products || [],
        pagination: data?.meta
          ? { total: data.meta.total, page: data.meta.page, per_page: data.meta.per_page, last_page: data.meta.last_page }
          : { total: 0, page: 1, per_page: 20, last_page: 1 },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  fetchProduct: async (id) => {
    const res = await api.get(`/admin/products/${id}`);
    return res.data?.product;
  },

  createProduct: async (data) => {
    const res = await api.post('/admin/products', data);
    return res.data?.product;
  },

  updateProduct: async (id, data) => {
    const res = await api.put(`/admin/products/${id}`, data);
    return res.data?.product;
  },

  deleteProduct: async (id) => {
    await api.delete(`/admin/products/${id}`);
  },

  duplicateProduct: async (id) => {
    const res = await api.post(`/admin/products/${id}/duplicate`);
    return res.data?.product;
  },

  toggleFeatured: async (id) => {
    const res = await api.put(`/admin/products/${id}/toggle-featured`);
    return res.data?.product;
  },

  toggleStatus: async (id) => {
    const res = await api.put(`/admin/products/${id}/toggle-status`);
    return res.data?.product;
  },

  bulkAction: async (ids, action) => {
    await api.post('/admin/products/bulk-action', { ids, action });
  },
}));

export default useProductsStore;
