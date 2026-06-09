import { create } from 'zustand';
import { adminLocationService } from '../services/admin/adminService';

const useLocationsStore = create((set, get) => ({
  countries: [],
  states: [],
  cities: [],
  loading: false,

  fetchCountries: async () => {
    set({ loading: true });
    try {
      const res = await adminLocationService.getCountries();
      set({ countries: res.data?.countries || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createCountry: async (data) => {
    const res = await adminLocationService.createCountry(data);
    return res.data;
  },

  updateCountry: async (id, data) => {
    const res = await adminLocationService.updateCountry(id, data);
    return res.data;
  },

  deleteCountry: async (id) => {
    await adminLocationService.deleteCountry(id);
    get().fetchCountries();
  },

  fetchStates: async (countryId) => {
    set({ loading: true });
    try {
      const res = await adminLocationService.getStates(countryId);
      set({ states: res.data?.states || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createState: async (data) => {
    const res = await adminLocationService.createState(data);
    return res.data;
  },

  updateState: async (id, data) => {
    const res = await adminLocationService.updateState(id, data);
    return res.data;
  },

  deleteState: async (id) => {
    await adminLocationService.deleteState(id);
    get().fetchStates();
  },

  fetchCities: async (stateId) => {
    set({ loading: true });
    try {
      const res = await adminLocationService.getCities(stateId);
      set({ cities: res.data?.cities || [] });
    } catch {} finally { set({ loading: false }); }
  },

  createCity: async (data) => {
    const res = await adminLocationService.createCity(data);
    return res.data;
  },

  updateCity: async (id, data) => {
    const res = await adminLocationService.updateCity(id, data);
    return res.data;
  },

  deleteCity: async (id) => {
    await adminLocationService.deleteCity(id);
    get().fetchCities();
  },
}));

export default useLocationsStore;
