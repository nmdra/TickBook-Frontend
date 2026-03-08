import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ── Auth API ──
export const authAPI = {
  login: (credentials) => api.post('/api/users/login', credentials),
  register: (userData) => api.post('/api/users/register', userData),
  getProfile: () => api.get('/api/users/profile'),
};

// ── Events API ──
export const eventsAPI = {
  getAll: () => api.get('/api/events'),
  getById: (id) => api.get(`/api/events/${id}`),
};

// ── Bookings API ──
export const bookingsAPI = {
  create: (bookingData) => api.post('/api/bookings', bookingData),
  getMyBookings: () => api.get('/api/bookings'),
  getById: (id) => api.get(`/api/bookings/${id}`),
};

// ── Payments API ──
export const paymentsAPI = {
  create: (paymentData) => api.post('/api/payments', paymentData),
  getByBookingId: (bookingId) => api.get(`/api/payments/booking/${bookingId}`),
};

export default api;
