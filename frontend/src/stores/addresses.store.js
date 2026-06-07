import { create } from 'zustand';
import { addressService } from '../services';

const useAddressStore = create((set, get) => ({
  addresses: [],
  loading: false,

  fetchAddresses: async () => {
    set({ loading: true });
    try {
      const res = await addressService.getAll();
      set({ addresses: res.data?.addresses || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createAddress: async (data) => {
    try {
      await addressService.create(data);
      await get().fetchAddresses();
    } catch {
      // ignore
    }
  },

  updateAddress: async (id, data) => {
    try {
      await addressService.update(id, data);
      await get().fetchAddresses();
    } catch {
      // ignore
    }
  },

  deleteAddress: async (id) => {
    try {
      await addressService.delete(id);
      set({ addresses: get().addresses.filter((a) => a.id !== id) });
    } catch {
      // ignore
    }
  },

  setDefault: async (id) => {
    try {
      await addressService.setDefault(id);
      await get().fetchAddresses();
    } catch {
      // ignore
    }
  },

  defaultAddress: () => get().addresses.find((a) => a.is_default) || null,
}));

export default useAddressStore;
