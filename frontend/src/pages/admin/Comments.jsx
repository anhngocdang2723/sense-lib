import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Modal, message, Tooltip, Tag } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getAdminComments, deleteComment, updateCommentStatus } from '../../services/api';
import './Comments.css';
import { useNavigate } from 'react-router-dom';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const navigate = useNavigate();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getAdminComments();
      if (response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể tải danh sách bình luận');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteComment(id);
      message.success('Xóa bình luận thành công');
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể xóa bình luận');
      }
    }
  };

  const handleStatusChange = async (comment, newStatus) => {
    try {
      await updateCommentStatus(comment.id, newStatus);
      message.success('Cập nhật trạng thái bình luận thành công');
      fetchComments();
    } catch (error) {
      console.error('Error updating comment status:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể cập nhật trạng thái bình luận');
      }
    }
  };

  const showViewModal = (comment) => {
    setSelectedComment(comment);
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
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text.length > 50 ? `${text.substring(0, 50)}...` : text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : status === 'HIDDEN' ? 'orange' : 'red'}>
          {status === 'ACTIVE' ? 'Hoạt động' : status === 'HIDDEN' ? 'Ẩn' : 'Đã xóa'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
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
          {record.status === 'ACTIVE' ? (
            <Button
              type="default"
              onClick={() => handleStatusChange(record, 'HIDDEN')}
            >
              Ẩn
            </Button>
          ) : record.status === 'HIDDEN' ? (
            <Button
              type="primary"
              onClick={() => handleStatusChange(record, 'ACTIVE')}
            >
              Hiện
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div className="comments-container">
      <h1>Quản lý bình luận</h1>
      <Table
        columns={columns}
        dataSource={comments}
        loading={loading}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} bình luận`,
        }}
      />

      <Modal
        title="Chi tiết bình luận"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedComment && (
          <div>
            <p><strong>Người dùng:</strong> {selectedComment.user.username}</p>
            <p><strong>Tài liệu:</strong> {selectedComment.document.title}</p>
            <p><strong>Nội dung:</strong> {selectedComment.content}</p>
            <p><strong>Trạng thái:</strong> {
              selectedComment.status === 'ACTIVE' ? 'Hoạt động' :
              selectedComment.status === 'HIDDEN' ? 'Ẩn' : 'Đã xóa'
            }</p>
            <p><strong>Ngày tạo:</strong> {new Date(selectedComment.created_at).toLocaleString('vi-VN')}</p>
            {selectedComment.is_edited && <p><em>Bình luận này đã được chỉnh sửa</em></p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Comments; 