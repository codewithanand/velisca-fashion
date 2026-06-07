import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),

  login: (data) => api.post('/auth/login', data),

  refresh: (token) => api.post('/auth/refresh', { refresh_token: token }),

  logout: () => api.post('/auth/logout'),

  logoutAll: () => api.post('/auth/logout-all'),

  me: () => api.get('/auth/me'),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export default authService;
