import { create } from 'zustand';
import { adminInventoryLogService } from '../services/admin/adminService';

const useInventoryLogsStore = create((set, get) => ({
  logs: [],
  loading: false,
  pagination: { page: 1, last_page: 1, total: 0 },

  fetchLogs: async (params) => {
    set({ loading: true });
    try {
      const res = await adminInventoryLogService.getAll(params);
      const logsData = res.data?.inventory_logs || {};
      set({
        logs: logsData.data || [],
        pagination: {
          page: logsData.current_page || 1,
          last_page: logsData.last_page || 1,
          total: logsData.total || 0,
        },
      });
    } catch {} finally { set({ loading: false }); }
  },

  createLog: async (data) => {
    const res = await adminInventoryLogService.create(data);
    return res.data;
  },
}));

export default useInventoryLogsStore;
