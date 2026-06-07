import config from '../config';
import { orders } from '../data/orders';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const orderService = {
  getAll: async () => {
    if (config.enableMock) {
      await delay(200);
      return orders;
    }
    const { api } = await import('./api');
    return api.get('/orders');
  },

  getById: async (id) => {
    if (config.enableMock) {
      await delay(150);
      return orders.find((o) => o.id === id);
    }
    const { api } = await import('./api');
    return api.get(`/orders/${id}`);
  },

  create: async (orderData) => {
    if (config.enableMock) {
      await delay(300);
      const order = {
        id: 'ORD-' + Date.now().toString(36).toUpperCase(),
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      return order;
    }
    const { api } = await import('./api');
    return api.post('/orders', orderData);
  },

  cancel: async (id) => {
    if (config.enableMock) {
      await delay(200);
      return { success: true, message: 'Order cancelled' };
    }
    const { api } = await import('./api');
    return api.patch(`/orders/${id}/cancel`);
  },
};

export default orderService;
