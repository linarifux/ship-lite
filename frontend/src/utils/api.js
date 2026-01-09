import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
});

// ADD THIS: Request Interceptor
api.interceptors.request.use((config) => {
  // 1. Get the connected shop from local storage
  const shopName = localStorage.getItem('shop_name');
  
  // 2. If it exists, add it to the headers
  if (shopName) {
    config.headers['x-shop-domain'] = shopName;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;