'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { login as authLogin, logout as authLogout } from '@/app/api/auth';

interface User {
  id: string;
  email: string;
  name: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On client-side only
    if (typeof window !== 'undefined') {
      // Get authentication status from localStorage
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';

      // Get user data from localStorage if available
      let userData = null;
      try {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          userData = JSON.parse(userDataString);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }

      setIsAuthenticated(isAuth);
      setUser(userData);
      setLoading(false);

      if (isAuth) {
        // Verify with backend if we have a valid session
        checkAuth();
      }
    }
  }, []);

  const checkAuth = async () => {
    try {
      // Only make the API call if we have authentication in localStorage
      if (localStorage.getItem('isAuthenticated') === 'true') {
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
          const userData = response.data.user || response.data;
          setUser(userData);

          // Update localStorage with fresh user data
          localStorage.setItem('userData', JSON.stringify(userData));
        } else {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authLogin({ email, password });

      if (response.success) {
        // Update local state
        setIsAuthenticated(true);
        setUser(response.user || null);

        return { success: true, user: response.user };
      }

      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { name, email, password },
        { withCredentials: true }
      );

      if (response.status === 201) {
        const userData = response.data.user || response.data;

        // Update localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));

        // Update state
        setIsAuthenticated(true);
        setUser(userData);

        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');

    // Update state
    setIsAuthenticated(false);
    setUser(null);
  };

  const logout = async () => {
    try {
      await authLogout();
      handleLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear the client state
      handleLogout();
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    refreshAuth: checkAuth,
  };
}
