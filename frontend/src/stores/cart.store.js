import { create } from 'zustand';
import { cartService } from '../services';

const SESSION_KEY = 'session_id';

function ensureSessionId() {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem(SESSION_KEY, sid);
  }
}

const useCartStore = create((set, get) => ({
  cart: null,
  items: [],
  summary: { subtotal: 0, discount: 0, shipping_charge: 0, tax: 0, grand_total: 0 },
  couponCode: null,
  loading: false,

  fetchCart: async () => {
    ensureSessionId();
    set({ loading: true });
    try {
      const res = await cartService.getCart();
      const cartData = res.data?.cart || {};
      set({
        cart: cartData,
        items: cartData.items || [],
        summary: {
          subtotal: cartData.subtotal || 0,
          discount: cartData.discount || 0,
          shipping_charge: cartData.shipping_charge || 0,
          tax: cartData.tax || 0,
          grand_total: cartData.grand_total || 0,
        },
        couponCode: cartData.coupon_code || null,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1, variantId = null) => {
    ensureSessionId();
    try {
      await cartService.add({ product_id: productId, quantity, variant_id: variantId });
      await get().fetchCart();
    } catch {
      // ignore
    }
  },

  updateItem: async (id, quantity) => {
    ensureSessionId();
    try {
      await cartService.update({ id, quantity });
      await get().fetchCart();
    } catch {
      // ignore
    }
  },

  removeItem: async (id) => {
    ensureSessionId();
    try {
      await cartService.remove(id);
      await get().fetchCart();
    } catch {
      // ignore
    }
  },

  clearCart: async () => {
    ensureSessionId();
    try {
      await cartService.clear();
      set({ cart: null, items: [], summary: { subtotal: 0, discount: 0, shipping_charge: 0, tax: 0, grand_total: 0 }, couponCode: null });
    } catch {
      // ignore
    }
  },

  applyCoupon: async (code) => {
    ensureSessionId();
    try {
      const res = await cartService.applyCoupon(code);
      const summary = res.data?.summary || {};
      set({
        summary: {
          subtotal: summary.subtotal || 0,
          discount: summary.discount || 0,
          shipping_charge: summary.shipping_charge || 0,
          tax: summary.tax || 0,
          grand_total: summary.grand_total || 0,
        },
        couponCode: summary.coupon_code || code,
      });
      return res;
    } catch (err) {
      throw err;
    }
  },

  removeCoupon: async () => {
    ensureSessionId();
    try {
      await cartService.removeCoupon();
      await get().fetchCart();
    } catch {
      // ignore
    }
  },

  saveForLater: async (id) => {
    ensureSessionId();
    try {
      await cartService.saveForLater({ id });
      await get().fetchCart();
    } catch {
      // ignore
    }
  },
}));

export default useCartStore;
