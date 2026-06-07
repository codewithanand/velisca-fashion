import api from '../api';

export const adminAuthService = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  me: () => api.get('/admin/me'),
};

export const adminProductService = {
  getAll: (params) => api.get('/admin/products', params),
  getById: (id) => api.get(`/admin/products/${id}`),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
};

export const adminOrderService = {
  getAll: (params) => api.get('/admin/orders', params),
  getById: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
};

export const adminUserService = {
  getAll: (params) => api.get('/admin/users', params),
  getById: (id) => api.get(`/admin/users/${id}`),
  toggleBlock: (id) => api.put(`/admin/users/${id}/toggle-block`),
};

export const adminCategoryService = {
  getAll: () => api.get('/admin/categories'),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

export const adminCouponService = {
  getAll: () => api.get('/admin/coupons'),
  create: (data) => api.post('/admin/coupons', data),
  update: (id, data) => api.put(`/admin/coupons/${id}`, data),
  delete: (id) => api.delete(`/admin/coupons/${id}`),
};

export const adminBannerService = {
  getAll: () => api.get('/admin/banners'),
  create: (data) => api.post('/admin/banners', data),
  update: (id, data) => api.put(`/admin/banners/${id}`, data),
  delete: (id) => api.delete(`/admin/banners/${id}`),
  toggleActive: (id) => api.put(`/admin/banners/${id}/toggle`),
};

export const adminAnalyticsService = {
  getDashboard: () => api.get('/admin/analytics/dashboard'),
  getRevenue: (params) => api.get('/admin/analytics/revenue', params),
  getOrders: (params) => api.get('/admin/analytics/orders', params),
  getUsers: (params) => api.get('/admin/analytics/users', params),
};

export const adminNotificationService = {
  getAll: () => api.get('/admin/notifications'),
  create: (data) => api.post('/admin/notifications', data),
  markRead: (id) => api.put(`/admin/notifications/${id}/read`),
  delete: (id) => api.delete(`/admin/notifications/${id}`),
};

export const adminSettingsService = {
  get: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
};
