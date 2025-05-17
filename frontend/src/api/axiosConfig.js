import axios from 'axios';
import { sessionService } from '../services/sessionService';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = sessionService.getSession();
    
    // Add authorization header if session exists
    if (session) {
      config.headers['Authorization'] = `Bearer ${session.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the session yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the session
        await sessionService.refreshSession();
        
        // Retry the original request
        const session = sessionService.getSession();
        originalRequest.headers['Authorization'] = `Bearer ${session.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear session and redirect to login
        sessionService.clearSession();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 