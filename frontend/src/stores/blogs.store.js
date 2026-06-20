import { create } from 'zustand';
import { adminBlogService } from '../services/admin/adminService';

const useBlogsStore = create((set, get) => ({
  blogs: [],
  loading: false,
  pagination: null,

  fetchBlogs: async (params) => {
    set({ loading: true });
    try {
      const res = await adminBlogService.getAll(params);
      const data = res.data;
      set({
        blogs: data?.data || data?.blogs || [],
        pagination: data?.meta || null,
      });
    } catch {} finally { set({ loading: false }); }
  },

  fetchBlog: async (id) => {
    const res = await adminBlogService.getById(id);
    return res.data?.blog;
  },

  createBlog: async (data) => {
    const res = await adminBlogService.create(data);
    return res.data;
  },

  updateBlog: async (id, data) => {
    const res = await adminBlogService.update(id, data);
    return res.data;
  },

  deleteBlog: async (id) => {
    await adminBlogService.delete(id);
    get().fetchBlogs();
  },
}));

export default useBlogsStore;
