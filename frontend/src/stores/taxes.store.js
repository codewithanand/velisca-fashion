import { create } from 'zustand';
import { adminTaxService } from '../services/admin/adminService';

const useTaxesStore = create((set, get) => ({
  taxes: [],
  loading: false,

  fetchTaxes: async () => {
    set({ loading: true });
    try {
      const res = await adminTaxService.getAll();
      set({ taxes: res.data?.tax_classes || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchTax: async (id) => {
    const res = await adminTaxService.getById(id);
    return res.data?.tax_class;
  },

  createTax: async (data) => {
    const res = await adminTaxService.create(data);
    return res.data;
  },

  updateTax: async (id, data) => {
    const res = await adminTaxService.update(id, data);
    return res.data;
  },

  deleteTax: async (id) => {
    await adminTaxService.delete(id);
    get().fetchTaxes();
  },
}));

export default useTaxesStore;
