import api from './api';

const wishlistService = {
  getAll: () => api.get('/wishlist'),
  add: (data) => api.post('/wishlist', data),
  remove: (id) => api.delete(`/wishlist/${id}`),
  moveToCart: (data) => api.post('/wishlist/move-to-cart', data),
};

export default wishlistService;
