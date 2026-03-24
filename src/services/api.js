import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

function resolveServiceURL(serviceEnvVar) {
  return import.meta.env[serviceEnvVar] || API_BASE_URL;
}

const EVENT_SERVICE_URL = resolveServiceURL('VITE_EVENT_SERVICE_URL');
const USER_SERVICE_URL = resolveServiceURL('VITE_USER_SERVICE_URL');
const BOOKING_SERVICE_URL = resolveServiceURL('VITE_BOOKING_SERVICE_URL');
const PAYMENT_SERVICE_URL = resolveServiceURL('VITE_PAYMENT_SERVICE_URL');

function createClient(baseURL) {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor — attach JWT to every outgoing request
  client.interceptors.request.use(
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
  client.interceptors.response.use(
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

  return client;
}

const eventClient = createClient(EVENT_SERVICE_URL);
const userClient = createClient(USER_SERVICE_URL);
const bookingClient = createClient(BOOKING_SERVICE_URL);
const paymentClient = createClient(PAYMENT_SERVICE_URL);

// ── Auth / User API (User Service — port 3002) ──
export const authAPI = {
  login: (credentials) => userClient.post('/api/users/login', credentials),
  register: (userData) => userClient.post('/api/users/register', userData),
  getProfile: () => userClient.get('/api/users/profile'),
};

// ── Events API (Event Service — port 3001) ──
export const eventsAPI = {
  getAll: () => eventClient.get('/api/events'),
  getById: (id) => eventClient.get(`/api/events/${id}`),
  checkAvailability: (id) => eventClient.get(`/api/events/${id}/availability`),
  create: (eventData) => eventClient.post('/api/events', eventData),
  update: (id, eventData) => eventClient.put(`/api/events/${id}`, eventData),
  delete: (id) => eventClient.delete(`/api/events/${id}`),
  getMyEvents: (userId) => eventClient.get(`/api/events/user/${userId}`),
};

// ── Bookings API (Booking Service — port 3003) ──
export const bookingsAPI = {
  create: (bookingData) => bookingClient.post('/api/bookings', bookingData),
  getAll: () => bookingClient.get('/api/bookings'),
  getByUser: (userId) => bookingClient.get(`/api/bookings/user/${userId}`),
  getById: (id) => bookingClient.get(`/api/bookings/${id}`),
  cancel: (id) => bookingClient.delete(`/api/bookings/${id}`),
  updateStatus: (id, status) => bookingClient.put(`/api/bookings/${id}/status`, { status }),
};

// ── Payments API (Payment Service — port 3004) ──
export const paymentsAPI = {
  create: (paymentData) => paymentClient.post('/api/payments', paymentData),
  getById: (id) => paymentClient.get(`/api/payments/${id}`),
  getByBookingId: (bookingId) => paymentClient.get(`/api/payments/booking/${bookingId}`),
  updateStatus: (id, status) => paymentClient.put(`/api/payments/${id}/status`, { status }),
};
