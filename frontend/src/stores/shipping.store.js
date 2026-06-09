import { create } from 'zustand';
import { adminShippingService } from '../services/admin/adminService';

const useShippingStore = create((set, get) => ({
  methods: [],
  zones: [],
  rates: [],
  loading: false,

  fetchMethods: async () => {
    set({ loading: true });
    try {
      const res = await adminShippingService.getMethods();
      set({ methods: res.data?.methods || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createMethod: async (data) => {
    const res = await adminShippingService.createMethod(data);
    return res.data;
  },

  updateMethod: async (id, data) => {
    const res = await adminShippingService.updateMethod(id, data);
    return res.data;
  },

  deleteMethod: async (id) => {
    await adminShippingService.deleteMethod(id);
    get().fetchMethods();
  },

  fetchZones: async () => {
    set({ loading: true });
    try {
      const res = await adminShippingService.getZones();
      set({ zones: res.data?.zones || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createZone: async (data) => {
    const res = await adminShippingService.createZone(data);
    return res.data;
  },

  updateZone: async (id, data) => {
    const res = await adminShippingService.updateZone(id, data);
    return res.data;
  },

  deleteZone: async (id) => {
    await adminShippingService.deleteZone(id);
    get().fetchZones();
  },

  fetchRates: async () => {
    set({ loading: true });
    try {
      const res = await adminShippingService.getRates();
      set({ rates: res.data?.rates || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createRate: async (data) => {
    const res = await adminShippingService.createRate(data);
    return res.data;
  },

  updateRate: async (id, data) => {
    const res = await adminShippingService.updateRate(id, data);
    return res.data;
  },

  deleteRate: async (id) => {
    await adminShippingService.deleteRate(id);
    get().fetchRates();
  },
}));

export default useShippingStore;
