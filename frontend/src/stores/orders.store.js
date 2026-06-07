import { create } from 'zustand';
import { orderService } from '../services';

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,

  fetchOrders: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await orderService.getAll(params);
      set({ orders: res.data?.orders?.data || res.data?.orders || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchOrder: async (id) => {
    set({ loading: true });
    try {
      const res = await orderService.getById(id);
      set({ currentOrder: res.data?.order || null, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  cancelOrder: async (id, reason = '') => {
    try {
      await orderService.cancel(id, { reason });
      await get().fetchOrder(id);
    } catch {
      // ignore
    }
  },

  returnOrder: async (id, reason = '') => {
    try {
      await orderService.returnOrder(id, { reason });
      await get().fetchOrder(id);
    } catch {
      // ignore
    }
  },

  trackOrder: async (id) => {
    try {
      const res = await orderService.track(id);
      return res.data;
    } catch {
      return null;
    }
  },

  clearCurrent: () => set({ currentOrder: null }),
}));

export default useOrderStore;
