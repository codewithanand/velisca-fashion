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
  duplicate: (id) => api.post(`/admin/products/${id}/duplicate`),
  toggleFeatured: (id) => api.put(`/admin/products/${id}/toggle-featured`),
  toggleStatus: (id) => api.put(`/admin/products/${id}/toggle-status`),
  bulkAction: (ids, action) => api.post('/admin/products/bulk-action', { ids, action }),
};

export const adminCategoryService = {
  getAll: (params) => api.get('/admin/categories', params),
  getTree: () => api.get('/admin/categories/tree'),
  getById: (id) => api.get(`/admin/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
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

export const adminReviewService = {
  getAll: (params) => api.get('/admin/reviews', params),
  approve: (id) => api.put(`/admin/reviews/${id}/approve`),
  reject: (id) => api.put(`/admin/reviews/${id}/reject`),
  delete: (id) => api.delete(`/admin/reviews/${id}`),
};

export const adminCollectionService = {
  getAll: (params) => api.get('/admin/collections', params),
  getById: (id) => api.get(`/admin/collections/${id}`),
  create: (data) => api.post('/admin/collections', data),
  update: (id, data) => api.put(`/admin/collections/${id}`, data),
  delete: (id) => api.delete(`/admin/collections/${id}`),
};

export const adminCouponService = {
  getAll: (params) => api.get('/admin/coupons', params),
  getById: (id) => api.get(`/admin/coupons/${id}`),
  create: (data) => api.post('/admin/coupons', data),
  update: (id, data) => api.put(`/admin/coupons/${id}`, data),
  delete: (id) => api.delete(`/admin/coupons/${id}`),
  toggle: (id) => api.put(`/admin/coupons/${id}/toggle`),
};

export const adminBannerService = {
  getAll: () => api.get('/admin/banners'),
  getById: (id) => api.get(`/admin/banners/${id}`),
  create: (data) => api.post('/admin/banners', data),
  update: (id, data) => api.put(`/admin/banners/${id}`, data),
  delete: (id) => api.delete(`/admin/banners/${id}`),
  toggle: (id) => api.put(`/admin/banners/${id}/toggle`),
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
  getGroups: () => api.get('/admin/settings/groups'),
};

export const adminAttributeService = {
  getAll: (params) => api.get('/admin/attributes', params),
  getById: (id) => api.get(`/admin/attributes/${id}`),
  create: (data) => api.post('/admin/attributes', data),
  update: (id, data) => api.put(`/admin/attributes/${id}`, data),
  delete: (id) => api.delete(`/admin/attributes/${id}`),
};

export const adminAttributeValueService = {
  getAll: (params) => api.get('/admin/attribute-values', params),
  create: (data) => api.post('/admin/attribute-values', data),
  update: (id, data) => api.put(`/admin/attribute-values/${id}`, data),
  delete: (id) => api.delete(`/admin/attribute-values/${id}`),
};

export const adminOrderStatusService = {
  getAll: () => api.get('/admin/order-statuses'),
  getById: (id) => api.get(`/admin/order-statuses/${id}`),
  create: (data) => api.post('/admin/order-statuses', data),
  update: (id, data) => api.put(`/admin/order-statuses/${id}`, data),
  delete: (id) => api.delete(`/admin/order-statuses/${id}`),
};

export const adminPaymentMethodService = {
  getAll: () => api.get('/admin/payment-methods'),
  getById: (id) => api.get(`/admin/payment-methods/${id}`),
  create: (data) => api.post('/admin/payment-methods', data),
  update: (id, data) => api.put(`/admin/payment-methods/${id}`, data),
  delete: (id) => api.delete(`/admin/payment-methods/${id}`),
  toggle: (id) => api.put(`/admin/payment-methods/${id}/toggle`),
};

export const adminShippingService = {
  getMethods: () => api.get('/admin/shipping/methods'),
  createMethod: (data) => api.post('/admin/shipping/methods', data),
  updateMethod: (id, data) => api.put(`/admin/shipping/methods/${id}`, data),
  deleteMethod: (id) => api.delete(`/admin/shipping/methods/${id}`),
  getZones: () => api.get('/admin/shipping/zones'),
  createZone: (data) => api.post('/admin/shipping/zones', data),
  updateZone: (id, data) => api.put(`/admin/shipping/zones/${id}`, data),
  deleteZone: (id) => api.delete(`/admin/shipping/zones/${id}`),
  getRates: () => api.get('/admin/shipping/rates'),
  createRate: (data) => api.post('/admin/shipping/rates', data),
  updateRate: (id, data) => api.put(`/admin/shipping/rates/${id}`, data),
  deleteRate: (id) => api.delete(`/admin/shipping/rates/${id}`),
};

export const adminTaxService = {
  getAll: () => api.get('/admin/tax-classes'),
  getById: (id) => api.get(`/admin/tax-classes/${id}`),
  create: (data) => api.post('/admin/tax-classes', data),
  update: (id, data) => api.put(`/admin/tax-classes/${id}`, data),
  delete: (id) => api.delete(`/admin/tax-classes/${id}`),
};

export const adminLocationService = {
  getCountries: () => api.get('/admin/countries'),
  createCountry: (data) => api.post('/admin/countries', data),
  updateCountry: (id, data) => api.put(`/admin/countries/${id}`, data),
  deleteCountry: (id) => api.delete(`/admin/countries/${id}`),
  getStates: (countryId) => api.get(`/admin/countries/${countryId}/states`),
  createState: (data) => api.post('/admin/states', data),
  updateState: (id, data) => api.put(`/admin/states/${id}`, data),
  deleteState: (id) => api.delete(`/admin/states/${id}`),
  getCities: (stateId) => api.get(`/admin/states/${stateId}/cities`),
  createCity: (data) => api.post('/admin/cities', data),
  updateCity: (id, data) => api.put(`/admin/cities/${id}`, data),
  deleteCity: (id) => api.delete(`/admin/cities/${id}`),
};

export const adminCourierService = {
  getAll: () => api.get('/admin/couriers'),
  create: (data) => api.post('/admin/couriers', data),
  update: (id, data) => api.put(`/admin/couriers/${id}`, data),
  delete: (id) => api.delete(`/admin/couriers/${id}`),
};

export const adminReviewStatusService = {
  getAll: () => api.get('/admin/review-statuses'),
  create: (data) => api.post('/admin/review-statuses', data),
  update: (id, data) => api.put(`/admin/review-statuses/${id}`, data),
  delete: (id) => api.delete(`/admin/review-statuses/${id}`),
};

export const adminWarehouseService = {
  getAll: () => api.get('/admin/warehouses'),
  getById: (id) => api.get(`/admin/warehouses/${id}`),
  create: (data) => api.post('/admin/warehouses', data),
  update: (id, data) => api.put(`/admin/warehouses/${id}`, data),
  delete: (id) => api.delete(`/admin/warehouses/${id}`),
};

export const adminInventoryLogService = {
  getAll: (params) => api.get('/admin/inventory-logs', params),
  create: (data) => api.post('/admin/inventory-logs', data),
};

export const adminSeoService = {
  getPages: () => api.get('/admin/seo-pages'),
  createPage: (data) => api.post('/admin/seo-pages', data),
  updatePage: (id, data) => api.put(`/admin/seo-pages/${id}`, data),
  deletePage: (id) => api.delete(`/admin/seo-pages/${id}`),
  getRedirects: () => api.get('/admin/redirects'),
  createRedirect: (data) => api.post('/admin/redirects', data),
  updateRedirect: (id, data) => api.put(`/admin/redirects/${id}`, data),
  deleteRedirect: (id) => api.delete(`/admin/redirects/${id}`),
};

export const adminMediaService = {
  getAll: (params) => api.get('/admin/media', params),
  create: (data) => api.post('/admin/media', data),
  update: (id, data) => api.put(`/admin/media/${id}`, data),
  delete: (id) => api.delete(`/admin/media/${id}`),
  getFolders: () => api.get('/admin/media/folders'),
  createFolder: (data) => api.post('/admin/media/folders', data),
  updateFolder: (id, data) => api.put(`/admin/media/folders/${id}`, data),
  deleteFolder: (id) => api.delete(`/admin/media/folders/${id}`),
};

export const adminBrandService = {
  getAll: (params) => api.get('/admin/brands', params),
  getById: (id) => api.get(`/admin/brands/${id}`),
  create: (data) => api.post('/admin/brands', data),
  update: (id, data) => api.put(`/admin/brands/${id}`, data),
  delete: (id) => api.delete(`/admin/brands/${id}`),
};

export const adminColorService = {
  getAll: () => api.get('/admin/colors'),
  getById: (id) => api.get(`/admin/colors/${id}`),
  create: (data) => api.post('/admin/colors', data),
  update: (id, data) => api.put(`/admin/colors/${id}`, data),
  delete: (id) => api.delete(`/admin/colors/${id}`),
};

export const adminSizeService = {
  getAll: () => api.get('/admin/sizes'),
  getById: (id) => api.get(`/admin/sizes/${id}`),
  create: (data) => api.post('/admin/sizes', data),
  update: (id, data) => api.put(`/admin/sizes/${id}`, data),
  delete: (id) => api.delete(`/admin/sizes/${id}`),
};

export const adminNotificationTemplateService = {
  getAll: () => api.get('/admin/notification-templates'),
  getById: (id) => api.get(`/admin/notification-templates/${id}`),
  create: (data) => api.post('/admin/notification-templates', data),
  update: (id, data) => api.put(`/admin/notification-templates/${id}`, data),
  delete: (id) => api.delete(`/admin/notification-templates/${id}`),
};

export const adminCmsPageService = {
  getAll: (params) => api.get('/admin/cms-pages', params),
  getById: (id) => api.get(`/admin/cms-pages/${id}`),
  create: (data) => api.post('/admin/cms-pages', data),
  update: (id, data) => api.put(`/admin/cms-pages/${id}`, data),
  delete: (id) => api.delete(`/admin/cms-pages/${id}`),
};

export const adminBlogService = {
  getAll: (params) => api.get('/admin/blogs', params),
  getById: (id) => api.get(`/admin/blogs/${id}`),
  create: (data) => api.post('/admin/blogs', data),
  update: (id, data) => api.put(`/admin/blogs/${id}`, data),
  delete: (id) => api.delete(`/admin/blogs/${id}`),
};

export const adminBlogCategoryService = {
  getAll: () => api.get('/admin/blog-categories'),
  getById: (id) => api.get(`/admin/blog-categories/${id}`),
  create: (data) => api.post('/admin/blog-categories', data),
  update: (id, data) => api.put(`/admin/blog-categories/${id}`, data),
  delete: (id) => api.delete(`/admin/blog-categories/${id}`),
};

export const adminHomepageService = {
  getLayout: () => api.get('/admin/homepage/layout'),
  getLayouts: () => api.get('/admin/homepage/layouts'),
  createLayout: (data) => api.post('/admin/homepage/layouts', data),
  updateLayout: (id, data) => api.put(`/admin/homepage/layouts/${id}`, data),
  deleteLayout: (id) => api.delete(`/admin/homepage/layouts/${id}`),
  getSections: (params) => api.get('/admin/homepage/sections', params),
  createSection: (data) => api.post('/admin/homepage/sections', data),
  updateSection: (id, data) => api.put(`/admin/homepage/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/admin/homepage/sections/${id}`),
  reorderSections: (data) => api.post('/admin/homepage/sections/reorder', data),
  createSectionItem: (data) => api.post('/admin/homepage/section-items', data),
  updateSectionItem: (id, data) => api.put(`/admin/homepage/section-items/${id}`, data),
  deleteSectionItem: (id) => api.delete(`/admin/homepage/section-items/${id}`),
};

export const adminAnnouncementService = {
  getAll: () => api.get('/admin/announcements'),
  getById: (id) => api.get(`/admin/announcements/${id}`),
  create: (data) => api.post('/admin/announcements', data),
  update: (id, data) => api.put(`/admin/announcements/${id}`, data),
  delete: (id) => api.delete(`/admin/announcements/${id}`),
};

export const adminPopupService = {
  getAll: () => api.get('/admin/popups'),
  getById: (id) => api.get(`/admin/popups/${id}`),
  create: (data) => api.post('/admin/popups', data),
  update: (id, data) => api.put(`/admin/popups/${id}`, data),
  delete: (id) => api.delete(`/admin/popups/${id}`),
};

export const adminNewsletterService = {
  getAll: (params) => api.get('/admin/newsletters', params),
  create: (data) => api.post('/admin/newsletters', data),
  update: (id, data) => api.put(`/admin/newsletters/${id}`, data),
  delete: (id) => api.delete(`/admin/newsletters/${id}`),
  export: () => api.get('/admin/newsletters/export'),
};

export const adminCampaignService = {
  getAll: (params) => api.get('/admin/campaigns', params),
  getById: (id) => api.get(`/admin/campaigns/${id}`),
  create: (data) => api.post('/admin/campaigns', data),
  update: (id, data) => api.put(`/admin/campaigns/${id}`, data),
  delete: (id) => api.delete(`/admin/campaigns/${id}`),
};
