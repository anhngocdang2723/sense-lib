import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Space, Popconfirm, Tag, Tooltip, Image } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, FileTextOutlined, UserOutlined, FolderOutlined, CalendarOutlined } from '@ant-design/icons';
import api, { endpoints } from '../../api/api';
import './PendingDocuments.css';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sessionService } from '../../services/sessionService';

const PendingDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Debug logs
    console.log('Token:', localStorage.getItem('token'));
    console.log('User Role:', localStorage.getItem('userRole'));
    console.log('User:', user);
    console.log('Is Authenticated:', isAuthenticated);
    
    // Check if user is authenticated and is admin
    const userRole = localStorage.getItem('userRole');
    if (!isAuthenticated || userRole !== 'ADMIN') {
      console.log('Authentication check failed:', { isAuthenticated, userRole });
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/login');
      return;
    }
    fetchPendingDocuments();
  }, [isAuthenticated, user, navigate]);

  // Fetch pending documents
  const fetchPendingDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.documents.list, {
        params: { 
          status: 'pending',
          limit: 100
        }
      });
      setDocuments(response.data.documents || response.data || []);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
      if (error.response?.status === 401) {
        console.log('401 Unauthorized error - Session expired');
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể tải danh sách tài liệu chờ duyệt');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (record) => {
    setSelectedDocument(record);
    setDetailsModalVisible(true);
  };

  // Handle approve document
  const handleApprove = async (id) => {
    try {
      await api.put(endpoints.documents.approve(id));
      message.success('Phê duyệt tài liệu thành công');
      fetchPendingDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể phê duyệt tài liệu');
      }
    }
  };

  // Handle reject document
  const handleReject = async (id) => {
    try {
      await api.put(endpoints.documents.reject(id));
      message.success('Từ chối tài liệu thành công');
      fetchPendingDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Không thể từ chối tài liệu');
      }
    }
  };

  // Helper function to get full image URL
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const cleanUrl = imageUrl.startsWith('/api') ? imageUrl.substring(4) : imageUrl;
    return `${import.meta.env.VITE_API_URL}${cleanUrl}`;
  };

  const columns = [
    {
      title: 'Ảnh bìa',
      key: 'image_url',
      width: 80,
      render: (_, record) => {
        const fullImageUrl = getFullImageUrl(record.image_url);
        return fullImageUrl ? (
          <Image
            src={fullImageUrl}
            alt={record.title}
            width={60}
            height={80}
            style={{ objectFit: 'cover' }}
            preview={{
              src: fullImageUrl,
              title: record.title
            }}
          />
        ) : (
          <div style={{ width: 60, height: 80, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileTextOutlined style={{ fontSize: 24, color: '#999' }} />
          </div>
        );
      }
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 220,
      render: (text) => (
        <div style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {text}
        </div>
      )
    },
    {
      title: 'Người đăng',
      key: 'uploader',
      width: 150,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>{record.added_by_user?.full_name || 'Không xác định'}</span>
        </Space>
      )
    },
    {
      title: 'Danh mục',
      key: 'category',
      width: 150,
      render: (_, record) => (
        <Space>
          <FolderOutlined />
          <span>{record.category?.name || 'Không xác định'}</span>
        </Space>
      )
    },
    {
      title: 'Điểm đề xuất',
      key: 'proposed_score',
      width: 120,
      render: (_, record) => (
        <Tag color="blue">{record.proposed_score || 0}</Tag>
      )
    },
    {
      title: 'Hết hạn',
      key: 'expires_at',
      width: 150,
      render: (_, record) => (
        <Space>
          <CalendarOutlined />
          <span>{record.expires_at ? dayjs(record.expires_at).format('DD/MM/YYYY HH:mm') : 'Không có'}</span>
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Phê duyệt">
            <Popconfirm
              title="Bạn có chắc chắn muốn phê duyệt tài liệu này?"
              onConfirm={() => handleApprove(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="primary" icon={<CheckOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Từ chối">
            <Popconfirm
              title="Bạn có chắc chắn muốn từ chối tài liệu này?"
              onConfirm={() => handleReject(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button danger icon={<CloseOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="pending-documents">
      <div className="pending-documents-header">
        <h1>Tài liệu chờ duyệt</h1>
      </div>

      <Table
        columns={columns}
        dataSource={documents}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        locale={{ emptyText: 'Không có tài liệu nào chờ duyệt' }}
      />

      {/* Document Details Modal */}
      <Modal
        title="Chi tiết tài liệu"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedDocument && (
          <div className="document-details">
            <div className="document-cover">
              {selectedDocument.image_url ? (
                <Image
                  src={getFullImageUrl(selectedDocument.image_url)}
                  alt={selectedDocument.title}
                  width={200}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 200, height: 280, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileTextOutlined style={{ fontSize: 48, color: '#999' }} />
                </div>
              )}
            </div>
            <div className="document-info">
              <h2>{selectedDocument.title}</h2>
              <p><strong>Mô tả:</strong> {selectedDocument.description || 'Không có'}</p>
              <p><strong>Danh mục:</strong> {selectedDocument.category?.name || 'Không có'}</p>
              <p><strong>Tác giả:</strong> {selectedDocument.authors?.map(a => a.name).join(', ') || 'Không có'}</p>
              <p><strong>Thể loại:</strong> {selectedDocument.tags?.map(tag => tag.name).join(', ') || 'Không có'}</p>
              <p><strong>Nhà xuất bản:</strong> {selectedDocument.publisher?.name || 'Không có'}</p>
              <p><strong>Ngôn ngữ:</strong> {selectedDocument.language_rel?.name || selectedDocument.language || 'Không có'}</p>
              <p><strong>Năm xuất bản:</strong> {selectedDocument.publication_year || 'Không có'}</p>
              <p><strong>ISBN:</strong> {selectedDocument.isbn || 'Không có'}</p>
              <p><strong>Phiên bản:</strong> {selectedDocument.version}</p>
              <p><strong>Điểm đề xuất:</strong> {selectedDocument.proposed_score || 0}</p>
              <p><strong>Người đăng:</strong> {selectedDocument.added_by_user?.full_name || 'Không có'}</p>
              <p><strong>Ngày đăng:</strong> {new Date(selectedDocument.created_at).toLocaleString()}</p>
              <p><strong>Hết hạn:</strong> {selectedDocument.expires_at ? new Date(selectedDocument.expires_at).toLocaleString() : 'Không có'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingDocuments; 