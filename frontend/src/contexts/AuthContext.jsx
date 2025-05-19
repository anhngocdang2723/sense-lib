import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // On 401, logout user
          await logout();
          navigate('/login');
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [navigate]);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/api/users/profile');
          const userData = response.data;
          setUser(userData);
          setIsAuthenticated(true);
          // Update role in localStorage to match server data
          localStorage.setItem('userRole', userData.role.toUpperCase());
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('userRole');
          // Only redirect to login if not already there
          if (!location.pathname.includes('/login')) {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const { access_token, user: userData } = response.data;
      
      if (!userData || !userData.role) {
        throw new Error('Invalid user data received');
      }

      // Store token and user data
      localStorage.setItem('token', access_token);
      localStorage.setItem('userRole', userData.role.toUpperCase());
      
      // Update auth state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Configure axios default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Redirect based on role and saved location
      const savedLocation = location.state?.from?.pathname;
      if (userData.role.toUpperCase() === 'ADMIN') {
        navigate(savedLocation || '/admin/dashboard');
      } else {
        navigate(savedLocation || '/');
      }
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.detail || error.message);
      throw error;
    }
  };

  const logout = async () => {
    // Clear axios default header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    // Reset auth state
    setUser(null);
    setIsAuthenticated(false);
    
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always redirect to login after logout
      navigate('/login');
    }
  };

  const isAdmin = () => {
    // Check both user object and localStorage to be safe
    const userRole = user?.role?.toUpperCase() || localStorage.getItem('userRole');
    return userRole === 'ADMIN';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 