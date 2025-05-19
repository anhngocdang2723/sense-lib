import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import App from './App.jsx'
import Login from './pages/user/Login.jsx'
import Home from './pages/user/Home.jsx'
import TextBook from './pages/user/TextBook.jsx'
import DocumentDetail from './pages/user/DocumentDetail.jsx'
import DocumentReader from './pages/user/DocumentReader.jsx'
import UploadDocument from './pages/user/UploadDocument'
import Profile from './pages/user/Profile'
import Favorites from './pages/user/Favorites'
import AdminLayout from './components/layouts/AdminLayout'
import AdminRoute from './components/auth/AdminRoute'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { adminRoutes } from './routes/AdminRoutes'
import 'antd/dist/reset.css' // Import Ant Design CSS
import './index.css'
import Comments from './pages/admin/Comments'
import Ratings from './pages/admin/Ratings'
import AdminFavorites from './pages/admin/Favorites'
// import mylike from './pages/user/mylike.jsx'     
// import document from './pages/user/documentlist.jsx'  
// import about from './pages/user/about.jsx'

// User Route component
const UserRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            {adminRoutes.map((route) => (
              <Route
                key={route.path}
                path={`/admin/${route.path}`}
                element={route.element}
              />
            ))}
          </Route>

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
            <Route path="user/upload" element={
              <UserRoute>
                <UploadDocument />
              </UserRoute>
            } />
            <Route path="profile" element={
              <UserRoute>
                <Profile />
              </UserRoute>
            } />
            <Route path="favorites" element={
              <UserRoute>
                <Favorites />
              </UserRoute>
            } />
            {/* Catch all for user routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
