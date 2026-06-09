import { create } from 'zustand';
import { adminPaymentMethodService } from '../services/admin/adminService';

const usePaymentMethodsStore = create((set, get) => ({
  paymentMethods: [],
  loading: false,

  fetchPaymentMethods: async () => {
    set({ loading: true });
    try {
      const res = await adminPaymentMethodService.getAll();
      set({ paymentMethods: res.data?.payment_methods || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchPaymentMethod: async (id) => {
    const res = await adminPaymentMethodService.getById(id);
    return res.data?.payment_method;
  },

  createPaymentMethod: async (data) => {
    const res = await adminPaymentMethodService.create(data);
    return res.data;
  },

  updatePaymentMethod: async (id, data) => {
    const res = await adminPaymentMethodService.update(id, data);
    return res.data;
  },

  deletePaymentMethod: async (id) => {
    await adminPaymentMethodService.delete(id);
    get().fetchPaymentMethods();
  },

  togglePaymentMethod: async (id) => {
    const res = await adminPaymentMethodService.toggle(id);
    return res.data;
  },
}));

export default usePaymentMethodsStore;
