import api from './api';

const checkoutService = {
  getSummary: () => api.post('/checkout/summary'),
  placeOrder: (data) => api.post('/checkout/place-order', data),
};

export default checkoutService;
