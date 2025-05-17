import React from 'react';
import { Row, Col, Button } from 'antd';
import { FileOutlined, UserOutlined, EyeOutlined, CheckCircleOutlined, TeamOutlined, TagsOutlined, FolderOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const staticStats = {
  totalDocuments: 1234,
  totalCategories: 45,
  totalTags: 12,
  totalAuthors: 56,
  totalUsers: 789,
  totalViews: 45678,
  processedDocuments: 1200,
};

const quickAccessButtons = [
  {
    title: 'Quản lý tài liệu',
    icon: <FileOutlined className="button-icon" />,
    path: '/admin/documents',
    color: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    count: staticStats.totalDocuments
  },
  {
    title: 'Quản lý danh mục',
    icon: <FolderOutlined className="button-icon" />,
    path: '/admin/categories',
    color: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
    count: staticStats.totalCategories
  },
  {
    title: 'Quản lý thể loại',
    icon: <TagsOutlined className="button-icon" />,
    path: '/admin/tags',
    color: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
    count: staticStats.totalTags
  },
  {
    title: 'Quản lý tác giả',
    icon: <TeamOutlined className="button-icon" />,
    path: '/admin/authors',
    color: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    count: staticStats.totalAuthors
  },
  {
    title: 'Quản lý người dùng',
    icon: <UserOutlined className="button-icon" />,
    path: '/admin/users',
    color: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
    count: staticStats.totalUsers
  }
];

const statCards = [
  {
    title: 'Tổng số tài liệu',
    value: staticStats.totalDocuments.toLocaleString(),
    icon: <FileOutlined />,
    bg: '#e6f7ff',
    iconColor: '#1890ff'
  },
  {
    title: 'Tổng số danh mục',
    value: staticStats.totalCategories.toLocaleString(),
    icon: <FolderOutlined />,
    bg: '#fff7e6',
    iconColor: '#fa8c16'
  },
  {
    title: 'Tổng số thể loại',
    value: staticStats.totalTags.toLocaleString(),
    icon: <TagsOutlined />,
    bg: '#fffbe6',
    iconColor: '#faad14'
  },
  {
    title: 'Tổng số tác giả',
    value: staticStats.totalAuthors.toLocaleString(),
    icon: <TeamOutlined />,
    bg: '#f6ffed',
    iconColor: '#52c41a'
  },
  {
    title: 'Tổng số người dùng',
    value: staticStats.totalUsers.toLocaleString(),
    icon: <UserOutlined />,
    bg: '#f9f0ff',
    iconColor: '#722ed1'
  },
  {
    title: 'Tổng lượt xem',
    value: staticStats.totalViews.toLocaleString(),
    icon: <EyeOutlined />,
    bg: '#e6fffb',
    iconColor: '#13c2c2'
  },
  {
    title: 'Tài liệu đã xử lý',
    value: staticStats.processedDocuments.toLocaleString(),
    icon: <CheckCircleOutlined />,
    bg: '#f6ffed',
    iconColor: '#52c41a'
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Dashboard</h1>
        <div className="quick-access-buttons">
          {quickAccessButtons.map((button, idx) => (
            <Button
              key={idx}
              type="primary"
              className="quick-access-button"
              onClick={() => navigate(button.path)}
              style={{
                background: button.color,
                borderColor: 'transparent',
              }}
            >
              <div className="quick-access-button-content">
                <span className="button-title">{button.title}</span>
                <span className="button-count">{button.count}</span>
              </div>
              {button.icon}
            </Button>
          ))}
        </div>
      </div>

      <div className="stats-cards">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div 
              className="stat-card-icon" 
              style={{ 
                color: card.iconColor,
                background: card.bg
              }}
            >
              {card.icon}
            </div>
            <div className="stat-card-content">
              <div className="stat-card-title">{card.title}</div>
              <div className="stat-card-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard; 