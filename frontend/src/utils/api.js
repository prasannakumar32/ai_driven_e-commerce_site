import axios from 'axios';

// In development with proxy: use relative path (will be proxied to http://localhost:5000)
// In production: use the full URL from env var
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'development' ? '/api' : 'http://localhost:5000/api'
);

// Debug: log the actual API URL at runtime
if (typeof window !== 'undefined') {
  console.debug('[API] Using baseURL:', API_BASE_URL);
  console.debug('[API] NODE_ENV:', process.env.NODE_ENV);
  console.debug('[API] REACT_APP_API_URL env:', process.env.REACT_APP_API_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ensure there is a guest identifier for anonymous carts
const ensureGuestId = () => {
  let id = localStorage.getItem('guestId');
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
    localStorage.setItem('guestId', id);
  }
  return id;
};

// Request interceptor to add auth token and guest id
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // attach guest id for anonymous cart persistence
    const guestId = localStorage.getItem('guestId') || ensureGuestId();
    if (guestId) config.headers['x-guest-id'] = guestId;
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
  getOrderTracking: (id) => api.get(`/orders/${id}/tracking`),
  updatePayment: (id, data) => api.put(`/orders/${id}/pay`, data),
  getOrderRecommendations: (id) => api.get(`/orders/${id}/recommendations`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  addTracking: (id, data) => api.put(`/orders/${id}/tracking`, data),
  getStats: () => api.get('/orders/stats/overview'),
  getOrdersByStatus: (status) => api.get(`/orders/by-status/${status}`),
  bulkUpdateStatus: (data) => api.put('/orders/bulk-update-status', data),
  createReview: (id, data) => api.post(`/orders/${id}/review`, data)
};

// Stripe API
export const stripeAPI = {
  getPublicKey: () => api.get('/stripe/public-key'),
  createCheckoutSession: (data) => api.post('/stripe/create-checkout-session', data),
  getSession: (sessionId) => api.get(`/stripe/session/${sessionId}`),
  createPaymentIntent: (data) => api.post('/stripe/create-payment-intent', data),
  confirmPayment: (data) => api.post('/stripe/confirm-payment', data)
};

// Payout API
export const payoutAPI = {
  getSellerPayouts: () => api.get('/payouts/seller'),
  getSummary: () => api.get('/payouts/seller/summary'),
  getAvailableOrders: () => api.get('/payouts/seller/available-orders'),
  requestPayout: (data) => api.post('/payouts/request', data),
  processPayout: (id) => api.put(`/payouts/${id}/process`),
  completePayout: (id, data) => api.put(`/payouts/${id}/complete`, data)
};
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
  getAddresses: () => api.get('/auth/addresses'),
  addAddress: (data) => api.post('/auth/addresses', data),
  updateAddress: (id, data) => api.put(`/auth/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/auth/addresses/${id}/set-default`)
};

export default api;
