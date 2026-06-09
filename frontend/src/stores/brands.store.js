import { create } from 'zustand';
import { adminBrandService } from '../services/admin/adminService';

const useBrandsStore = create((set, get) => ({
  brands: [],
  loading: false,

  fetchBrands: async (params) => {
    set({ loading: true });
    try {
      const clean = params ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')) : undefined;
      const res = await adminBrandService.getAll(clean);
      set({ brands: res.data?.data?.brands || res.data?.brands || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchBrand: async (id) => {
    const res = await adminBrandService.getById(id);
    return res.data?.data?.brand || res.data?.brand;
  },

  createBrand: async (data) => {
    const res = await adminBrandService.create(data);
    return res.data;
  },

  updateBrand: async (id, data) => {
    const res = await adminBrandService.update(id, data);
    return res.data;
  },

  deleteBrand: async (id) => {
    await adminBrandService.delete(id);
    get().fetchBrands();
  },
}));

export default useBrandsStore;
