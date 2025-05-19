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
    console.log('Token in interceptor:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request headers:', config.headers);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Response error:', error.response?.status, error.response?.data);

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting to refresh token...');
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await api.post(endpoints.auth.refresh);
        const { access_token } = response.data;
        console.log('Token refreshed successfully');

        // Save new token
        localStorage.setItem('token', access_token);
        console.log('New token stored:', localStorage.getItem('token'));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

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
  users: {
    list: '/api/users/list',
    create: '/api/users/create',
    detail: (id) => `/api/users/${id}`,
    update: (id) => `/api/users/${id}`,
    delete: (id) => `/api/users/${id}`,
    updateStatus: (id) => `/api/users/${id}/status`,
    updateRole: (id) => `/api/users/${id}/role`,
  },
  user: {
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
    forgotPassword: '/api/users/forgot-password',
    resetPassword: '/api/users/reset-password',
  },
  // Document endpoints
  documents: {
    list: '/api/documents/list',
    create: '/api/documents/upload',
    detail: (id) => `/api/documents/${id}`,
    detailBySlug: (slug) => `/api/documents/slug/${slug}`,
    update: (id) => `/api/documents/${id}`,
    delete: (id) => `/api/documents/${id}`,
    summary: (id) => `/api/documents/${id}/summary`,
    audio: (id) => `/api/documents/${id}/audio`,
    view: (id) => `/api/documents/${id}/view`,
    userUpload: '/api/documents/user/upload',
    userDocuments: '/api/documents/user/list',
    approveDocument: (id) => `/api/documents/${id}/approve`,
    rejectDocument: (id) => `/api/documents/${id}/reject`,
  },
  // Category endpoints
  categories: {
    list: '/api/categories/',
    detail: (id) => `/api/categories/${id}`,
    create: '/api/categories/',
    update: (id) => `/api/categories/${id}`,
    delete: (id) => `/api/categories/${id}`,
  },
  // Language endpoints
  languages: {
    list: '/api/languages/',
    detail: (id) => `/api/languages/${id}`,
  },
  // Author endpoints
  authors: {
    list: '/api/authors/',
    create: '/api/authors/',
    detail: (id) => `/api/authors/${id}`,
    update: (id) => `/api/authors/${id}`,
    delete: (id) => `/api/authors/${id}`,
  },
  // Admin endpoints
  admin: {
    dashboard: {
      stats: '/api/admin/dashboard/stats',
    },
    users: {
      list: '/api/admin/users',
      create: '/api/admin/users',
      update: (id) => `/api/admin/users/${id}`,
      delete: (id) => `/api/admin/users/${id}`,
      updateStatus: (id) => `/api/admin/users/${id}/status`,
      updateRole: (id) => `/api/admin/users/${id}/role`,
    }
  },
  tags: {
    list: '/api/tags/',
    create: '/api/tags/',
    detail: (id) => `/api/tags/${id}`,
    update: (id) => `/api/tags/${id}`,
    delete: (id) => `/api/tags/${id}`,
  },
  publishers: {
    list: '/api/publishers/',
    create: '/api/publishers/',
    detail: (id) => `/api/publishers/${id}`,
    update: (id) => `/api/publishers/${id}`,
    delete: (id) => `/api/publishers/${id}`,
  },
  favorites: {
    add: '/api/favorites/',
    remove: (id) => `/api/favorites/${id}`,
    count: (id) => `/api/favorites/count/${id}`,
    isFavorited: (id) => `/api/favorites/user/${id}`,
    toggle: (documentId) => `/api/favorites/${documentId}`,
    check: (documentId) => `/api/favorites/${documentId}/check`,
    list: '/api/favorites',
    admin: {
      all: '/api/favorites/admin/all',
      delete: (favoriteId) => `/api/favorites/admin/${favoriteId}`
    }
  },
  // Reading progress endpoints
  readingProgress: {
    create: '/api/reading-progress/',
    list: '/api/reading-progress/',
    get: (id) => `/api/reading-progress/${id}`,
    update: (id) => `/api/reading-progress/${id}`,
    delete: (id) => `/api/reading-progress/${id}`,
    sync: '/api/reading-progress/sync',
    resolveConflict: (id) => `/api/reading-progress/${id}/resolve-conflict`,
  },
  ratings: {
    create: '/api/ratings',
    byDocument: (documentId) => `/api/ratings/document/${documentId}`,
    average: (documentId) => `/api/ratings/document/${documentId}/average`,
    update: (ratingId) => `/api/ratings/${ratingId}`,
    delete: (ratingId) => `/api/ratings/${ratingId}`,
    admin: {
      all: '/api/ratings/admin/all',
      delete: (ratingId) => `/api/ratings/admin/${ratingId}`
    }
  },
  comments: {
    create: '/api/comments',
    byDocument: (documentId) => `/api/comments/document/${documentId}`,
    update: (commentId) => `/api/comments/${commentId}`,
    delete: (commentId) => `/api/comments/${commentId}`,
    admin: {
      all: '/api/comments/admin/all',
      updateStatus: (commentId) => `/api/comments/admin/${commentId}/status`,
      delete: (commentId) => `/api/comments/admin/${commentId}`
    }
  },
  // Grok chat endpoints
  grok: {
    chat: '/api/grok/chat',
    history: '/api/grok/history',
    clearHistory: '/api/grok/history/clear'
  },
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}${endpoint}`;
};

export default api;