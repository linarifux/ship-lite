import axios from 'axios';

  const BACKEND_URL =
    import.meta.env.VITE_ENV === "development"
      ? import.meta.env.VITE_DEV_BACKEND_URL
      : import.meta.env.VITE_PROD_BACKEND_URL;

console.log(BACKEND_URL);

const api = axios.create({
  baseURL: 'https://ship-lite.vercel.app',
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