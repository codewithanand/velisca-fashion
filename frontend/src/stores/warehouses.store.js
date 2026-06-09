import { create } from 'zustand';
import { adminWarehouseService } from '../services/admin/adminService';

const useWarehousesStore = create((set, get) => ({
  warehouses: [],
  loading: false,

  fetchWarehouses: async () => {
    set({ loading: true });
    try {
      const res = await adminWarehouseService.getAll();
      set({ warehouses: res.data?.warehouses || [] });
    } catch {} finally { set({ loading: false }); }
  },

  fetchWarehouse: async (id) => {
    const res = await adminWarehouseService.getById(id);
    return res.data?.warehouse;
  },

  createWarehouse: async (data) => {
    const res = await adminWarehouseService.create(data);
    return res.data;
  },

  updateWarehouse: async (id, data) => {
    const res = await adminWarehouseService.update(id, data);
    return res.data;
  },

  deleteWarehouse: async (id) => {
    await adminWarehouseService.delete(id);
    get().fetchWarehouses();
  },
}));

export default useWarehousesStore;
