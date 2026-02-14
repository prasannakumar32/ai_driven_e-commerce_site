import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getRecommendations: (id) => api.get(`/products/${id}/recommendations`),
  searchProducts: (data) => api.post('/products/search', data),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// AI API
export const aiAPI = {
  getRecommendations: (userId) => api.get(`/ai/recommendations/${userId}`),
  chatbot: (data) => api.post('/ai/chatbot', data),
  smartSearch: (data) => api.post('/ai/smart-search', data),
  getTrending: (params) => api.get('/ai/trending', { params }),
  getSimilar: (productId, params) => api.get(`/ai/similar/${productId}`, { params }),
  updateProfile: (userId, data) => api.post(`/ai/update-profile/${userId}`, data),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateCart: (data) => api.put('/cart/update', data),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
  getSummary: () => api.get('/cart/summary'),
  getRecommendations: () => api.post('/cart/recommendations'),
};

// Order API
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders/myorders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  updatePayment: (id, data) => api.put(`/orders/${id}/pay`, data),
  getOrderRecommendations: (id) => api.get(`/orders/${id}/recommendations`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  getStats: () => api.get('/orders/stats/overview'),
};

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePreferences: (data) => api.put('/auth/preferences', data),
  updateAIProfile: (data) => api.put('/auth/ai-profile', data),
  getHistory: () => api.get('/auth/history'),
  addToHistory: (data) => api.post('/auth/history', data),
  clearHistory: () => api.delete('/auth/history'),
};

export default api;
