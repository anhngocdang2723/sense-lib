import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Modal, message, Rate, Tooltip } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getAdminRatings, deleteRating } from '../../services/api';
import './Ratings.css';
import { useNavigate } from 'react-router-dom';

const Ratings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const navigate = useNavigate();

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await getAdminRatings();
      if (response.data) {
        setRatings(response.data);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể tải danh sách đánh giá');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteRating(id);
      message.success('Xóa đánh giá thành công');
      fetchRatings();
    } catch (error) {
      console.error('Error deleting rating:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể xóa đánh giá');
      }
    }
  };

  const showViewModal = (rating) => {
    setSelectedRating(rating);
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
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating} />,
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (text) => text && (
        <Tooltip title={text}>
          <span>{text.length > 50 ? `${text.substring(0, 50)}...` : text}</span>
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
    <div className="ratings-container">
      <h1>Quản lý đánh giá</h1>
      <Table
        columns={columns}
        dataSource={ratings}
        loading={loading}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} đánh giá`,
        }}
      />

      <Modal
        title="Chi tiết đánh giá"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRating && (
          <div>
            <p><strong>Người dùng:</strong> {selectedRating.user.username}</p>
            <p><strong>Tài liệu:</strong> {selectedRating.document.title}</p>
            <p>
              <strong>Đánh giá:</strong>
              <Rate disabled defaultValue={selectedRating.rating} style={{ marginLeft: 8 }} />
            </p>
            {selectedRating.comment && (
              <p><strong>Nhận xét:</strong> {selectedRating.comment}</p>
            )}
            <p><strong>Ngày tạo:</strong> {new Date(selectedRating.created_at).toLocaleString('vi-VN')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Ratings; 