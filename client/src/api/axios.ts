import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Remove trailing /api if it exists to prevent duplicate /api/api routes
const CLEAN_API_URL = API_URL.replace(/\/api$/, '');

console.log('📡 [API] Connecting to:', CLEAN_API_URL);

export const api = axios.create({
  baseURL: `${CLEAN_API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bba_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bba_token');
      localStorage.removeItem('bba_user');
      if (!window.location.pathname.includes('/admin/login') && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = axios.create({
  baseURL: `${CLEAN_API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('bba_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bba_admin_token');
      localStorage.removeItem('bba_admin');
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);
