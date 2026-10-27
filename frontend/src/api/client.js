/**
 * Axios instance with JWT interceptors.
 *
 * - Attaches Bearer access token to every request.
 * - On 401, attempts a single refresh using the refresh token.
 * - Clears storage and redirects to /login when refresh fails.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      clearSession();
      return Promise.reject(error);
    }

    original._retry = true;

    // Deduplicate concurrent refresh attempts
    refreshing =
      refreshing ||
      axios
        .post(`${API_BASE}/auth/refresh/`, { refresh })
        .then((res) => {
          localStorage.setItem('access_token', res.data.access);
          if (res.data.refresh) {
            localStorage.setItem('refresh_token', res.data.refresh);
          }
          return res.data.access;
        })
        .finally(() => {
          refreshing = null;
        });

    try {
      const access = await refreshing;
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  }
);

function clearSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default api;
