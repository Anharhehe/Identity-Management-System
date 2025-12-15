// Frontend utility functions for authentication
export const authUtils = {
  // Store authentication data
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get stored user data
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Remove authentication data
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Make authenticated API request
  fetchWithAuth: async (url, options = {}) => {
    const token = authUtils.getToken();
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // If token is invalid, clear auth data
    if (response.status === 401) {
      authUtils.clearAuth();
      window.location.href = '/login';
    }

    return response;
  },

  // Logout user
  logout: async () => {
    const token = authUtils.getToken();
    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    authUtils.clearAuth();
    window.location.href = '/';
  },
};

// React hook for authentication state
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authUtils.getToken();
    const userData = authUtils.getUser();

    if (token && userData) {
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const login = (token, userData) => {
    authUtils.setAuth(token, userData);
    setUser(userData);
  };

  const logout = () => {
    authUtils.clearAuth();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};