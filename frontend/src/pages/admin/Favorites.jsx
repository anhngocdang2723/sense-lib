import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Modal, message, Tooltip } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getAdminFavorites, deleteFavorite } from '../../services/api';
import './Favorites.css';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getAdminFavorites();
      if (response.data) {
        setFavorites(response.data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể tải danh sách yêu thích');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteFavorite(id);
      message.success('Xóa yêu thích thành công');
      fetchFavorites();
    } catch (error) {
      console.error('Error deleting favorite:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể xóa yêu thích');
      }
    }
  };

  const showViewModal = (favorite) => {
    setSelectedFavorite(favorite);
    setViewModalVisible(true);
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: ['user', 'username'],
      key: 'username',
    },
    {
      title: 'Tài liệu',
      dataIndex: ['document', 'title'],
      key: 'document',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showViewModal(record)}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="favorites-container">
      <h1>Quản lý yêu thích</h1>
      <Table
        columns={columns}
        dataSource={favorites}
        loading={loading}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} yêu thích`,
        }}
      />

      <Modal
        title="Chi tiết yêu thích"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedFavorite && (
          <div>
            <p><strong>Người dùng:</strong> {selectedFavorite.user.username}</p>
            <p><strong>Tài liệu:</strong> {selectedFavorite.document.title}</p>
            <p><strong>Ngày tạo:</strong> {new Date(selectedFavorite.created_at).toLocaleString('vi-VN')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Favorites; 