const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
  sessions: {
    create: '/api/sessions/',
    list: '/api/sessions/me',
    delete: (sessionId) => `/api/sessions/${sessionId}`,
    accessLogs: {
      create: '/api/sessions/access-logs',
      list: '/api/sessions/access-logs',
      get: (logId) => `/api/sessions/access-logs/${logId}`,
    }
  },
  // User endpoints
  user: {
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
  },
  // Document endpoints
  documents: {
    list: '/api/documents/list',
    detail: (id) => `/api/documents/${id}`,
    create: '/api/documents/upload',
    update: (id) => `/api/documents/${id}`,
    delete: (id) => `/api/documents/${id}`,
    summary: (id) => `/api/documents/${id}/summary`,
    audio: (id) => `/api/documents/${id}/audio`,
  },
  // Category endpoints
  categories: {
    list: '/api/categories',
    detail: (id) => `/api/categories/${id}`,
  },
  // Language endpoints
  languages: {
    list: '/api/languages',
    detail: (id) => `/api/languages/${id}`,
  },
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}${endpoint}`;
};

export default api;