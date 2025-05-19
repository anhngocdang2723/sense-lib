import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Header.css';
import logo from '../assets/original.png';
import { useAuth } from '../contexts/AuthContext';
import { UploadOutlined, UserOutlined, LogoutOutlined, SettingOutlined, HeartOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Space } from 'antd';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = {
    items: [
      {
        key: 'profile',
        label: <Link to="/profile">Thông tin cá nhân</Link>,
        icon: <UserOutlined />,
      },
      {
        key: 'favorites',
        label: <Link to="/favorites">Tài liệu yêu thích</Link>,
        icon: <HeartOutlined />,
      },
      {
        key: 'settings',
        label: <Link to="/settings">Cài đặt</Link>,
        icon: <SettingOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: 'Đăng xuất',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo" />
          <span className="library-name">SenseLib</span>
        </Link>
      </div>

      <div className="navbar-center">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Tìm kiếm học liệu, tài liệu..."
        />
      </div>

      <button className="mobile-menu-button" onClick={toggleMenu} aria-label="Toggle menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={isMenuOpen ? 
            "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" : 
            "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"} 
            fill="currentColor"/>
        </svg>
      </button>

      <div className={`navbar-right ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/documents" className="nav-button" onClick={() => setIsMenuOpen(false)}>Danh sách tài liệu</Link>
        <Link to="/about" className="nav-button" onClick={() => setIsMenuOpen(false)}>Giới thiệu</Link>
        <Link to="/contact" className="nav-button" onClick={() => setIsMenuOpen(false)}>Phản hồi</Link>
        {!user ? (
          <Link to="/login" className="login-button" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
        ) : (
          <>
            <Link to="/user/upload" className="nav-button">
              <UploadOutlined /> Tải lên tài liệu
            </Link>
            <Dropdown menu={userMenuItems} placement="bottomRight" trigger={['click']}>
              <Space className="user-avatar-dropdown">
                <Avatar 
                  src={user.avatar_url} 
                  icon={<UserOutlined />} 
                  size="default"
                />
                <span className="user-name">{user.username}</span>
              </Space>
            </Dropdown>
          </>
        )}
      </div>
    </nav>
  );
}

export default Header; 