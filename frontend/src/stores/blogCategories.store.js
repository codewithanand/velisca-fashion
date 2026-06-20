import { create } from 'zustand';
import { adminBlogCategoryService } from '../services/admin/adminService';

const useBlogCategoriesStore = create((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const res = await adminBlogCategoryService.getAll();
      set({ categories: res.data?.categories || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createCategory: async (data) => {
    const res = await adminBlogCategoryService.create(data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await adminBlogCategoryService.update(id, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    await adminBlogCategoryService.delete(id);
    get().fetchCategories();
  },
}));

export default useBlogCategoriesStore;
