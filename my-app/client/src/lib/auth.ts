// Authentication utility functions for client-side use

export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

export const authUtils = {
  // Store authentication data
  setAuth: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Get stored token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Get stored user data
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Remove authentication data
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  },

  // Make authenticated API request
  fetchWithAuth: async (url: string, options: RequestInit = {}) => {
    const token = authUtils.getToken();
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // If token is invalid, clear auth data and redirect
    if (response.status === 401) {
      authUtils.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }

    return response;
  },

  // Logout user
  logout: async (apiUrl: string) => {
    const token = authUtils.getToken();
    if (token) {
      try {
        await fetch(`${apiUrl}/auth/logout`, {
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
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },
};
