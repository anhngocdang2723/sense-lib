const API_URL = import.meta.env.VITE_API_URL;

export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    forgotPassword: '/api/auth/forgot-password',
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
export const getApiUrl = (endpoint) => `${API_URL}${endpoint}`; 