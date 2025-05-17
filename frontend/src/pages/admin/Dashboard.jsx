import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { FileOutlined, UserOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api, { endpoints } from '../../api/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalUsers: 0,
    totalViews: 0,
    processedDocuments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(endpoints.admin.dashboard.stats);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Documents"
              value={stats.totalDocuments}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Views"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Processed Documents"
              value={stats.processedDocuments}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 