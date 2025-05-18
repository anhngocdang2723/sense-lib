import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Login from './pages/user/Login.jsx'
import Home from './pages/user/Home.jsx'
import TextBook from './pages/user/TextBook.jsx'
import DocumentDetail from './pages/user/DocumentDetail.jsx'
import DocumentReader from './pages/user/DocumentReader.jsx'
import AdminLayout from './components/layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminDocuments from './pages/admin/Documents'
import AdminAuthors from './pages/admin/Authors'
import AdminTags from './pages/admin/Tags'
import AdminPublishers from './pages/admin/Publishers'
import AdminCategories from './pages/admin/Categories'
import AdminUsers from './pages/admin/AdminUsers'
import 'antd/dist/reset.css' // Import Ant Design CSS
import './index.css'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Check if user is logged in
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN'; // Check if user is admin

  console.log('ProtectedRoute check:', {
    isAuthenticated,
    isAdmin,
    userRole: localStorage.getItem('userRole')
  });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log('Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('Admin access granted');
  return children;
};

// User Route component
const UserRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';
  
  console.log('UserRoute check:', {
    isAuthenticated,
    isAdmin,
    userRole: localStorage.getItem('userRole')
  });
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Nếu là admin, chuyển hướng đến dashboard
  if (isAdmin) {
    console.log('Admin detected, redirecting to dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log('User access granted');
  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* User routes */}
        <Route path="/" element={<App />}>
          <Route index element={
            <UserRoute>
              <Home />
            </UserRoute>
          } />
          <Route path="text-book/:id" element={
            <UserRoute>
              <TextBook />
            </UserRoute>
          } />
          <Route path="document/:slug" element={
            <UserRoute>
              <DocumentDetail />
            </UserRoute>
          } />
          <Route path="read/:slug" element={
            <UserRoute>
              <DocumentReader />
            </UserRoute>
          } />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="authors" element={<AdminAuthors />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="publishers" element={<AdminPublishers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Catch all route - redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
