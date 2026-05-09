import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://teamtaskmanagement-production-af49.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Don't add auth header for login/register endpoints
  if (config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/register'))) {
    return config;
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
