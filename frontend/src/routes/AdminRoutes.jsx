import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  DashboardOutlined,
  FileOutlined,
  UserOutlined,
  TeamOutlined,
  TagsOutlined,
  BookOutlined,
  FolderOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  StarOutlined,
  HeartOutlined,
} from '@ant-design/icons';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminDocuments from '../pages/admin/Documents';
import PendingDocuments from '../pages/admin/PendingDocuments';
import AdminAuthors from '../pages/admin/Authors';
import AdminTags from '../pages/admin/Tags';
import AdminPublishers from '../pages/admin/Publishers';
import AdminUsers from '../pages/admin/AdminUsers';
import Comments from '../pages/admin/Comments';
import Ratings from '../pages/admin/Ratings';
import Favorites from '../pages/admin/Favorites';

export const adminRoutes = [
  {
    path: '',
    element: <Navigate to="dashboard" replace />
  },
  {
    path: 'dashboard',
    element: <AdminDashboard />,
    icon: <DashboardOutlined />,
    label: 'Dashboard'
  },
  {
    path: 'documents',
    element: <AdminDocuments />,
    icon: <FileOutlined />,
    label: 'Quản lý tài liệu'
  },
  {
    path: 'pending-documents',
    element: <PendingDocuments />,
    icon: <ClockCircleOutlined />,
    label: 'Tài liệu chờ duyệt'
  },
  {
    path: 'authors',
    element: <AdminAuthors />,
    icon: <TeamOutlined />,
    label: 'Quản lý tác giả'
  },
  {
    path: 'tags',
    element: <AdminTags />,
    icon: <TagsOutlined />,
    label: 'Quản lý thể loại'
  },
  {
    path: 'publishers',
    element: <AdminPublishers />,
    icon: <BookOutlined />,
    label: 'Quản lý nhà xuất bản'
  },
  {
    path: 'users',
    element: <AdminUsers />,
    icon: <UserOutlined />,
    label: 'Quản lý người dùng'
  },
  {
    path: 'comments',
    element: <Comments />,
    icon: <CommentOutlined />,
    label: 'Quản lý bình luận'
  },
  {
    path: 'ratings',
    element: <Ratings />,
    icon: <StarOutlined />,
    label: 'Quản lý đánh giá'
  },
  {
    path: 'favorites',
    element: <Favorites />,
    icon: <HeartOutlined />,
    label: 'Quản lý yêu thích'
  }
]; 