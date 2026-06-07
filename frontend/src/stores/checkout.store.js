import { create } from 'zustand';
import { checkoutService } from '../services';

const useCheckoutStore = create((set, get) => ({
  summary: null,
  placing: false,
  lastOrder: null,
  error: null,

  fetchSummary: async () => {
    try {
      const res = await checkoutService.getSummary();
      set({ summary: res.data?.summary || null });
    } catch {
      // ignore
    }
  },

  placeOrder: async (data) => {
    set({ placing: true, error: null });
    try {
      const res = await checkoutService.placeOrder(data);
      set({ lastOrder: res.data?.order || null, placing: false });
      return res.data?.order;
    } catch (err) {
      set({ error: err.message || 'Failed to place order', placing: false });
      throw err;
    }
  },

  reset: () => set({ summary: null, lastOrder: null, error: null }),
}));

export default useCheckoutStore;
