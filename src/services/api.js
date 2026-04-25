import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function resolveServiceURL(serviceEnvVar) {
  return import.meta.env[serviceEnvVar] || API_BASE_URL;
}

const EVENT_SERVICE_URL = resolveServiceURL('VITE_EVENT_SERVICE_URL');
const USER_SERVICE_URL = resolveServiceURL('VITE_USER_SERVICE_URL');
const BOOKING_SERVICE_URL = resolveServiceURL('VITE_BOOKING_SERVICE_URL');
const PAYMENT_SERVICE_URL = resolveServiceURL('VITE_PAYMENT_SERVICE_URL');

const AUTH_SKIP_URLS = ['/api/users/login', '/api/users/register', '/api/users/refresh-token'];

let refreshPromise = null;

function isAuthSkipUrl(url = '') {
  return AUTH_SKIP_URLS.some((skipUrl) => url.includes(skipUrl));
}

function clearStoredSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${USER_SERVICE_URL}/api/users/refresh-token`, { refreshToken })
      .then(({ data }) => {
        localStorage.setItem('token', data.token);
        return data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function createClient(baseURL) {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

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

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isAuthSkipUrl(originalRequest.url)
      ) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch {
          clearStoredSession();
          window.location.href = '/login';
        }
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

export const authAPI = {
  googleAuthUrl: `${USER_SERVICE_URL}/api/users/auth/google`,
  login: (credentials) => userClient.post('/api/users/login', credentials),
  register: (userData) => userClient.post('/api/users/register', userData),
  refreshToken: (refreshToken) => userClient.post('/api/users/refresh-token', { refreshToken }),
  logout: (refreshToken) => userClient.post('/api/users/logout', { refreshToken }),
  getProfile: () => userClient.get('/api/users/profile'),
};

export const eventsAPI = {
  getAll: () => eventClient.get('/api/events'),
  getById: (id) => eventClient.get(`/api/events/${id}`),
  checkAvailability: (id) => eventClient.get(`/api/events/${id}/availability`),
  create: (eventData) => eventClient.post('/api/events', eventData),
  update: (id, eventData) => eventClient.put(`/api/events/${id}`, eventData),
  delete: (id) => eventClient.delete(`/api/events/${id}`),
  getMyEvents: (userId) => eventClient.get(`/api/events/user/${userId}`),
};

export const bookingsAPI = {
  create: (bookingData) => bookingClient.post('/api/bookings', bookingData),
  getAll: () => bookingClient.get('/api/bookings'),
  getByUser: (userId) => bookingClient.get(`/api/bookings/user/${userId}`),
  getById: (id) => bookingClient.get(`/api/bookings/${id}`),
  cancel: (id) => bookingClient.delete(`/api/bookings/${id}`),
  updateStatus: (id, status) => bookingClient.put(`/api/bookings/${id}/status`, { status }),
};

export const paymentsAPI = {
  create: (paymentData) => paymentClient.post('/api/payments', paymentData),
  getById: (id) => paymentClient.get(`/api/payments/${id}`),
  getByBookingId: (bookingId) => paymentClient.get(`/api/payments/booking/${bookingId}`),
  updateStatus: (id, status) => paymentClient.put(`/api/payments/${id}/status`, { status }),
};
