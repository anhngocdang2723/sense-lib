import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  FileOutlined,
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  TagsOutlined,
  BookOutlined,
  FolderOutlined,
  LogoutOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  StarOutlined,
  HeartOutlined,
  InteractionOutlined,
} from '@ant-design/icons';
import './AdminLayout.css';
import { useAuth } from '../../contexts/AuthContext';
import { adminRoutes } from '../../routes/AdminRoutes';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Convert admin routes to menu structure
  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      type: 'divider',
    },
    {
      key: 'content',
      label: 'Quản lý nội dung',
      children: [
        {
          key: '/admin/documents',
          icon: <FileOutlined />,
          label: 'Quản lý tài liệu',
          onClick: () => navigate('/admin/documents'),
        },
        {
          key: '/admin/pending-documents',
          icon: <ClockCircleOutlined />,
          label: 'Tài liệu chờ duyệt',
          onClick: () => navigate('/admin/pending-documents'),
        },
        {
          key: '/admin/categories',
          icon: <FolderOutlined />,
          label: 'Quản lý danh mục',
          onClick: () => navigate('/admin/categories'),
        },
        {
          key: '/admin/tags',
          icon: <TagsOutlined />,
          label: 'Quản lý thể loại',
          onClick: () => navigate('/admin/tags'),
        },
      ],
    },
    {
      key: 'metadata',
      label: 'Quản lý metadata',
      children: [
        {
          key: '/admin/authors',
          icon: <TeamOutlined />,
          label: 'Quản lý tác giả',
          onClick: () => navigate('/admin/authors'),
        },
        {
          key: '/admin/publishers',
          icon: <BookOutlined />,
          label: 'Quản lý nhà xuất bản',
          onClick: () => navigate('/admin/publishers'),
        },
      ],
    },
    {
      key: 'interactions',
      label: 'Quản lý tương tác',
      icon: <InteractionOutlined />,
      children: [
        {
          key: '/admin/comments',
          icon: <CommentOutlined />,
          label: 'Quản lý bình luận',
          onClick: () => navigate('/admin/comments'),
        },
        {
          key: '/admin/ratings',
          icon: <StarOutlined />,
          label: 'Quản lý đánh giá',
          onClick: () => navigate('/admin/ratings'),
        },
        {
          key: '/admin/favorites',
          icon: <HeartOutlined />,
          label: 'Quản lý yêu thích',
          onClick: () => navigate('/admin/favorites'),
        },
      ],
    },
    {
      key: 'system',
      label: 'Hệ thống',
      children: [
        {
          key: '/admin/users',
          icon: <UserOutlined />,
          label: 'Quản lý người dùng',
          onClick: () => navigate('/admin/users'),
        },
        {
          key: '/admin/settings',
          icon: <SettingOutlined />,
          label: 'Cài đặt',
          onClick: () => navigate('/admin/settings'),
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/admin/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="admin-layout">
      <Sider width={250} className="admin-sider">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['content', 'metadata', 'system', 'interactions']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <h1>Welcome, Admin</h1>
            </div>
            <div className="admin-header-right">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                className="header-icon-button"
              />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-dropdown">
                  <Avatar icon={<UserOutlined />} />
                  <span className="user-name">Admin</span>
                </div>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 