import { create } from 'zustand';
import { adminOrderStatusService } from '../services/admin/adminService';

const useOrderStatusesStore = create((set, get) => ({
  orderStatuses: [],
  loading: false,

  fetchOrderStatuses: async () => {
    set({ loading: true });
    try {
      const res = await adminOrderStatusService.getAll();
      set({ orderStatuses: res.data?.order_statuses || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchOrderStatus: async (id) => {
    const res = await adminOrderStatusService.getById(id);
    return res.data?.order_status;
  },

  createOrderStatus: async (data) => {
    const res = await adminOrderStatusService.create(data);
    return res.data;
  },

  updateOrderStatus: async (id, data) => {
    const res = await adminOrderStatusService.update(id, data);
    return res.data;
  },

  deleteOrderStatus: async (id) => {
    await adminOrderStatusService.delete(id);
    get().fetchOrderStatuses();
  },
}));

export default useOrderStatusesStore;
