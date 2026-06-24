import api from './api';

function withSession(data = {}) {
  const sid = localStorage.getItem('session_id');
  if (sid) data.session_id = sid;
  return data;
}

const cartService = {
  getCart: () => api.get('/cart', withSession()),

  add: (data) => api.post('/cart/add', withSession(data)),

  update: (data) => api.put('/cart/update', withSession(data)),

  remove: (id) => api.delete(`/cart/remove/${id}`),

  clear: () => api.post('/cart/clear', withSession()),

  applyCoupon: (code) => api.post('/cart/apply-coupon', withSession({ code })),

  removeCoupon: () => api.post('/cart/remove-coupon', withSession()),

  saveForLater: (data) => api.post('/cart/save-for-later', withSession(data)),

  summary: () => api.get('/cart/summary', withSession()),
};

export default cartService;
