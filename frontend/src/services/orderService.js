import api from './api';

const orderService = {
  getAll: (params) => api.get('/orders', params),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, data) => api.post(`/orders/${id}/cancel`, data),
  returnOrder: (id, data) => api.post(`/orders/${id}/return`, data),
  track: (id) => api.get(`/orders/${id}/track`),
};

export default orderService;
