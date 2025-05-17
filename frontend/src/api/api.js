const API_URL = import.meta.env.VITE_API_URL;

export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  sessions: {
    create: '/sessions/',
    list: '/sessions/me',
    delete: (sessionId) => `/sessions/${sessionId}`,
    accessLogs: {
      create: '/sessions/access-logs',
      list: '/sessions/access-logs',
      get: (logId) => `/sessions/access-logs/${logId}`,
    }
  },
  // User endpoints
  user: {
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
  },
  // Document endpoints
  documents: {
    list: '/api/documents',
    detail: (id) => `/api/documents/${id}`,
    create: '/api/documents',
    update: (id) => `/api/documents/${id}`,
    delete: (id) => `/api/documents/${id}`,
  }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  return `${baseUrl}${endpoint}`;
};