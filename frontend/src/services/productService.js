import config from '../config';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { banners } from '../data/banners';
import { reviews } from '../data/reviews';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const mockProducts = {
  getAll: async (params = {}) => {
    if (config.enableMock) {
      await delay(200);
      let result = [...products];
      if (params.category) {
        result = result.filter((p) => p.category === params.category);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
      if (params.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
      if (params.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
      if (params.sort === 'rating') result.sort((a, b) => b.rating - a.rating);
      return { data: result, total: result.length };
    }
    const { api } = await import('./api');
    return api.get('/products', params);
  },

  getById: async (id) => {
    if (config.enableMock) {
      await delay(150);
      const product = products.find((p) => p.id === Number(id));
      if (!product) throw new Error('Product not found');
      return product;
    }
    const { api } = await import('./api');
    return api.get(`/products/${id}`);
  },

  getByCategory: async (category) => {
    if (config.enableMock) {
      await delay(200);
      return products.filter((p) => p.category === category);
    }
    const { api } = await import('./api');
    return api.get('/products', { category });
  },

  getTrending: async () => {
    if (config.enableMock) {
      await delay(150);
      return products.filter((p) => p.isTrending);
    }
    const { api } = await import('./api');
    return api.get('/products/trending');
  },

  getNewArrivals: async () => {
    if (config.enableMock) {
      await delay(150);
      return products.filter((p) => p.isNew);
    }
    const { api } = await import('./api');
    return api.get('/products/new');
  },
};

const mockCategories = {
  getAll: async () => {
    if (config.enableMock) {
      await delay(100);
      return categories;
    }
    const { api } = await import('./api');
    return api.get('/categories');
  },
};

const mockBanners = {
  getAll: async () => {
    if (config.enableMock) {
      await delay(100);
      return banners.filter((b) => b.isActive);
    }
    const { api } = await import('./api');
    return api.get('/banners');
  },
};

const mockReviews = {
  getByProduct: async (productId) => {
    if (config.enableMock) {
      await delay(200);
      return reviews.filter((r) => r.productId === Number(productId));
    }
    const { api } = await import('./api');
    return api.get('/reviews', { productId });
  },
};

const productService = {
  ...mockProducts,
  categories: mockCategories,
  banners: mockBanners,
  reviews: mockReviews,
};

export default productService;
export { mockProducts, mockCategories, mockBanners, mockReviews };
