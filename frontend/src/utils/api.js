import axios from 'axios';

// Create an axios instance
const api = axios.create({
  // Use the environment variable, or fallback to localhost for development
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
});

export default api;