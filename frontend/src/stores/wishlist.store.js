import { create } from 'zustand';
import { wishlistService } from '../services';

const useWishlistStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await wishlistService.getAll();
      set({ items: res.data?.wishlist_items || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addToWishlist: async (productId, variantId = null) => {
    try {
      await wishlistService.add({ product_id: productId, variant_id: variantId });
      await get().fetchWishlist();
    } catch {
      // ignore
    }
  },

  removeFromWishlist: async (id) => {
    try {
      await wishlistService.remove(id);
      set({ items: get().items.filter((item) => item.id !== id) });
    } catch {
      // ignore
    }
  },

  moveToCart: async (wishlistItemId) => {
    try {
      await wishlistService.moveToCart({ wishlist_item_id: wishlistItemId });
      set({ items: get().items.filter((item) => item.id !== wishlistItemId) });
    } catch {
      // ignore
    }
  },

  isInWishlist: (productId) => get().items.some((item) => item.product_id === productId),
}));

export default useWishlistStore;
