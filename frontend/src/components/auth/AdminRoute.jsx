import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading state if auth is still being checked
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    message.error('Vui lòng đăng nhập để tiếp tục');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin()) {
    message.error('Bạn không có quyền truy cập trang này');
    return <Navigate to="/" replace />;
  }

  // If we're on the login page and already authenticated as admin, redirect to dashboard
  if (location.pathname === '/login' && isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default AdminRoute; 