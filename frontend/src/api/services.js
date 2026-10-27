/**
 * Thin API wrappers — keep HTTP details out of page components.
 */
import api from './client';

export const authApi = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  register: (payload) => api.post('/auth/register/', payload),
  me: () => api.get('/auth/me/'),
};

export const dashboardApi = {
  farm: () => api.get('/dashboard/'),
  platform: () => api.get('/admin/metrics/'),
};

export const pricingApi = {
  plans: () => api.get('/pricing/plans/'),
};

export const farmsApi = {
  list: (params) => api.get('/admin/farms/', { params }),
  suspend: (id) => api.post(`/admin/farms/${id}/suspend/`),
  activate: (id) => api.post(`/admin/farms/${id}/activate/`),
  setPricing: (id, data) => api.post(`/admin/farms/${id}/set-pricing/`, data),
};

export const animalsApi = {
  list: (params) => api.get('/animals/', { params }),
  create: (data) => api.post('/animals/', data),
  update: (id, data) => api.patch(`/animals/${id}/`, data),
  remove: (id) => api.delete(`/animals/${id}/`),
};

export const cropsApi = {
  list: (params) => api.get('/crops/', { params }),
  create: (data) => api.post('/crops/', data),
  update: (id, data) => api.patch(`/crops/${id}/`, data),
  remove: (id) => api.delete(`/crops/${id}/`),
};

export const financesApi = {
  list: (params) => api.get('/transactions/', { params }),
  summary: () => api.get('/transactions/summary/'),
  create: (data) => api.post('/transactions/', data),
  remove: (id) => api.delete(`/transactions/${id}/`),
};

export const tasksApi = {
  list: (params) => api.get('/tasks/', { params }),
  create: (data) => api.post('/tasks/', data),
  updateStatus: (id, data) => api.post(`/tasks/${id}/update-status/`, data),
  verify: (id, data) => api.post(`/tasks/${id}/verify/`, data),
  awaitingReview: () => api.get('/tasks/awaiting-review/'),
  remove: (id) => api.delete(`/tasks/${id}/`),
};

export const employeesApi = {
  list: (params) => api.get('/auth/employees/', { params }),
  workers: () => api.get('/auth/employees/workers/'),
  create: (data) => api.post('/auth/employees/', data),
  update: (id, data) => api.patch(`/auth/employees/${id}/`, data),
  remove: (id) => api.delete(`/auth/employees/${id}/`),
};

export const salariesApi = {
  list: (params) => api.get('/salaries/', { params }),
  mine: () => api.get('/salaries/mine/'),
  create: (data) => api.post('/salaries/', data),
  update: (id, data) => api.patch(`/salaries/${id}/`, data),
  remove: (id) => api.delete(`/salaries/${id}/`),
};

export const vacationsApi = {
  list: (params) => api.get('/vacations/', { params }),
  pending: () => api.get('/vacations/pending/'),
  create: (data) => api.post('/vacations/', data),
  review: (id, data) => api.post(`/vacations/${id}/review/`, data),
  remove: (id) => api.delete(`/vacations/${id}/`),
};
