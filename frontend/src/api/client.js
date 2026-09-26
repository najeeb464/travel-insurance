import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tayara_access_token') || localStorage.getItem('tavara_access_token') || localStorage.getItem('ekta_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('tayara_refresh_token') || localStorage.getItem('tavara_refresh_token') || localStorage.getItem('ekta_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/token/refresh/', {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('tayara_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('tayara_access_token');
          localStorage.removeItem('tayara_refresh_token');
          localStorage.removeItem('tavara_access_token');
          localStorage.removeItem('tavara_refresh_token');
          localStorage.removeItem('ekta_access_token');
          localStorage.removeItem('ekta_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
