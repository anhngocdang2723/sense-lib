import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
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
} from '@ant-design/icons';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Group menu items by category
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Dashboard</Link>,
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
          label: <Link to="/admin/documents">Quản lý tài liệu</Link>,
        },
        {
          key: '/admin/categories',
          icon: <FolderOutlined />,
          label: <Link to="/admin/categories">Quản lý danh mục</Link>,
        },
        {
          key: '/admin/tags',
          icon: <TagsOutlined />,
          label: <Link to="/admin/tags">Quản lý thể loại</Link>,
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
          label: <Link to="/admin/authors">Quản lý tác giả</Link>,
        },
        {
          key: '/admin/publishers',
          icon: <BookOutlined />,
          label: <Link to="/admin/publishers">Quản lý nhà xuất bản</Link>,
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
          label: <Link to="/admin/users">Quản lý người dùng</Link>,
        },
        {
          key: '/admin/settings',
          icon: <SettingOutlined />,
          label: <Link to="/admin/settings">Cài đặt</Link>,
        },
      ],
    },
  ];

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    // Redirect to login page
    navigate('/login');
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
          defaultOpenKeys={['content', 'metadata', 'system']}
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