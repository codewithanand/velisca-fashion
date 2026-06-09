import { create } from 'zustand';
import { adminCourierService } from '../services/admin/adminService';

const useCouriersStore = create((set, get) => ({
  couriers: [],
  loading: false,

  fetchCouriers: async () => {
    set({ loading: true });
    try {
      const res = await adminCourierService.getAll();
      set({ couriers: res.data?.couriers || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createCourier: async (data) => {
    const res = await adminCourierService.create(data);
    return res.data;
  },

  updateCourier: async (id, data) => {
    const res = await adminCourierService.update(id, data);
    return res.data;
  },

  deleteCourier: async (id) => {
    await adminCourierService.delete(id);
    get().fetchCouriers();
  },
}));

export default useCouriersStore;
