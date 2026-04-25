import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextValue';
import { authAPI } from '../services/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(credentials);
      const token = data.token;
      const refreshToken = data.refreshToken;
      const userData = data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      await authAPI.register(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const completeTokenLogin = useCallback(async ({ token, refreshToken }) => {
    if (!token || !refreshToken) {
      return { success: false, message: 'Missing Google authentication token.' };
    }

    setLoading(true);
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      const { data } = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);

      return { success: true };
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return { success: false, message: err.response?.data?.error || err.response?.data?.message || 'Google login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      void authAPI.logout(refreshToken).catch(() => {});
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Handle direct redirect from backend Google OAuth callback.
  // Backend redirects to http://localhost:5173/?accessToken=...&refreshToken=...
  // We read the tokens, log the user in, then clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      return;
    }

    // Clean tokens from URL immediately so they are not visible
    window.history.replaceState({}, document.title, window.location.pathname);

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    authAPI.getProfile()
      .then(({ data }) => {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      authAPI.getProfile()
        .then(({ data }) => {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, register, completeTokenLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
