import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form, Input, Select, message, Space, Upload, Spin } from 'antd';
import { FileOutlined, UserOutlined, EyeOutlined, CheckCircleOutlined, TeamOutlined, TagsOutlined, FolderOutlined, LockOutlined, UnlockOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api, { endpoints } from '../../api/api';
import './Dashboard.css';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalCategories: 0,
    totalTags: 0,
    totalAuthors: 0,
    totalUsers: 0,
    totalViews: 0,
    processedDocuments: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    verifiedUsers: 0
  });

  // Document management states
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [tags, setTags] = useState([]);
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch documents stats
        const documentsRes = await api.get(endpoints.documents.list);
        const documents = documentsRes.data.documents || [];
        
        // Fetch users stats
        const usersRes = await api.get(endpoints.users.list);
        const users = usersRes.data.users || [];

        // Fetch reference data
        const [categoriesRes, languagesRes, authorsRes, tagsRes, publishersRes] = await Promise.all([
          api.get(endpoints.categories.list),
          api.get(endpoints.languages.list),
          api.get(endpoints.authors.list),
          api.get(endpoints.tags.list),
          api.get(endpoints.publishers.list)
        ]);

        setCategories(categoriesRes.data.categories || []);
        setLanguages(languagesRes.data.languages || []);
        setAuthors(authorsRes.data.authors || []);
        setTags(tagsRes.data.tags || []);
        setPublishers(publishersRes.data.publishers || []);

        setStats({
          totalDocuments: documents.length,
          totalCategories: categoriesRes.data.categories?.length || 0,
          totalTags: tagsRes.data.tags?.length || 0,
          totalAuthors: authorsRes.data.authors?.length || 0,
          totalUsers: users.length,
          totalViews: 45678, // Replace with actual API call
          processedDocuments: documents.filter(d => d.status === 'ACTIVE').length,
          activeUsers: users.filter(u => u.is_active).length,
          inactiveUsers: users.filter(u => !u.is_active).length,
          verifiedUsers: users.filter(u => u.is_verified).length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Handle document edit
  const handleEdit = (record) => {
    setEditingDocument(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      category_id: record.category_id,
      access_level: record.access_level,
      language: record.language,
      publication_year: record.publication_year,
      isbn: record.isbn,
      is_featured: record.is_featured,
      author_ids: record.authors ? record.authors.map(a => a.id) : [],
      tag_ids: record.tags ? record.tags.map(tag => tag.id) : [],
      publisher_id: record.publisher_id
    });
    setModalVisible(true);
  };

  // Handle document update
  const handleSubmit = async (values) => {
    if (!values.title || !values.category_id || !values.author_ids || !values.language) {
      message.error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }

    if (values.isbn && !/^[0-9-]{10,20}$/.test(values.isbn)) {
      message.error('ISBN không hợp lệ! Chỉ cho phép số và dấu gạch ngang, độ dài 10-20 ký tự.');
      return;
    }

    const cleanValues = { ...values };
    delete cleanValues.file;
    delete cleanValues.image;

    Object.keys(cleanValues).forEach(key => {
      if (cleanValues[key] === undefined || cleanValues[key] === null) {
        delete cleanValues[key];
      }
    });

    try {
      if (editingDocument) {
        await api.put(endpoints.documents.update(editingDocument.id), cleanValues);
        message.success('Cập nhật tài liệu thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingDocument(null);
      // Refresh stats
      const documentsRes = await api.get(endpoints.documents.list);
      const documents = documentsRes.data.documents || [];
      setStats(prev => ({
        ...prev,
        totalDocuments: documents.length,
        processedDocuments: documents.filter(d => d.status === 'ACTIVE').length
      }));
    } catch (error) {
      console.error('Error updating document:', error);
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        message.error(detail.map(e => e.msg).join('; '));
      } else if (typeof detail === 'string') {
        message.error(detail);
      } else {
        message.error('Không thể cập nhật tài liệu');
      }
    }
  };

  // Handle document upload
  const handleUpload = async (values) => {
    setUploading(true);
    try {
      if (!Array.isArray(values.file) || !values.file[0] || !values.file[0].originFileObj) {
        message.error('Vui lòng chọn file để upload');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', values.file[0].originFileObj);

      const documentData = {
        title: values.title,
        description: values.description || '',
        category_id: values.category_id,
        language: values.language,
        access_level: values.access_level,
        version: values.version || '1.0',
        publication_year: values.publication_year,
        isbn: values.isbn,
        publisher_id: values.publisher_id,
        is_featured: values.is_featured || false
      };

      if (values.author_ids && values.author_ids.length) {
        formData.append('authors', JSON.stringify(values.author_ids));
      }
      if (values.tag_ids && values.tag_ids.length) {
        formData.append('tags', JSON.stringify(values.tag_ids));
      }

      Object.keys(documentData).forEach(key => {
        if (documentData[key] !== undefined && documentData[key] !== null) {
          formData.append(key, documentData[key]);
        }
      });

      const response = await api.post(endpoints.documents.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        message.success('Upload tài liệu thành công!');
        setUploadModalVisible(false);
        uploadForm.resetFields();
        // Refresh stats
        const documentsRes = await api.get(endpoints.documents.list);
        const documents = documentsRes.data.documents || [];
        setStats(prev => ({
          ...prev,
          totalDocuments: documents.length,
          processedDocuments: documents.filter(d => d.status === 'ACTIVE').length
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.message ||
        'Upload tài liệu thất bại!';
      message.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const quickAccessButtons = [
    {
      title: 'Quản lý tài liệu',
      icon: <FileOutlined className="button-icon" />,
      path: '/admin/documents',
      color: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
      count: stats.totalDocuments
    },
    {
      title: 'Quản lý danh mục',
      icon: <FolderOutlined className="button-icon" />,
      path: '/admin/categories',
      color: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
      count: stats.totalCategories
    },
    {
      title: 'Quản lý thể loại',
      icon: <TagsOutlined className="button-icon" />,
      path: '/admin/tags',
      color: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
      count: stats.totalTags
    },
    {
      title: 'Quản lý tác giả',
      icon: <TeamOutlined className="button-icon" />,
      path: '/admin/authors',
      color: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
      count: stats.totalAuthors
    },
    {
      title: 'Quản lý người dùng',
      icon: <UserOutlined className="button-icon" />,
      path: '/admin/users',
      color: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
      count: stats.totalUsers
    }
  ];

  const statCards = [
    {
      title: 'Tổng số tài liệu',
      value: stats.totalDocuments.toLocaleString(),
      icon: <FileOutlined />,
      bg: '#e6f7ff',
      iconColor: '#1890ff'
    },
    {
      title: 'Tổng số danh mục',
      value: stats.totalCategories.toLocaleString(),
      icon: <FolderOutlined />,
      bg: '#fff7e6',
      iconColor: '#fa8c16'
    },
    {
      title: 'Tổng số thể loại',
      value: stats.totalTags.toLocaleString(),
      icon: <TagsOutlined />,
      bg: '#fffbe6',
      iconColor: '#faad14'
    },
    {
      title: 'Tổng số tác giả',
      value: stats.totalAuthors.toLocaleString(),
      icon: <TeamOutlined />,
      bg: '#f6ffed',
      iconColor: '#52c41a'
    },
    {
      title: 'Tổng số người dùng',
      value: stats.totalUsers.toLocaleString(),
      icon: <UserOutlined />,
      bg: '#f9f0ff',
      iconColor: '#722ed1'
    },
    {
      title: 'Người dùng đang hoạt động',
      value: stats.activeUsers.toLocaleString(),
      icon: <LockOutlined />,
      bg: '#f6ffed',
      iconColor: '#52c41a'
    },
    {
      title: 'Người dùng không hoạt động',
      value: stats.inactiveUsers.toLocaleString(),
      icon: <UnlockOutlined />,
      bg: '#fff1f0',
      iconColor: '#ff4d4f'
    },
    {
      title: 'Người dùng đã xác thực',
      value: stats.verifiedUsers.toLocaleString(),
      icon: <CheckCircleOutlined />,
      bg: '#e6f7ff',
      iconColor: '#1890ff'
    },
    {
      title: 'Tổng lượt xem',
      value: stats.totalViews.toLocaleString(),
      icon: <EyeOutlined />,
      bg: '#e6fffb',
      iconColor: '#13c2c2'
    },
    {
      title: 'Tài liệu đã xử lý',
      value: stats.processedDocuments.toLocaleString(),
      icon: <CheckCircleOutlined />,
      bg: '#f6ffed',
      iconColor: '#52c41a'
    }
  ];

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

      {/* Edit Document Modal */}
      <Modal
        title="Chỉnh sửa tài liệu"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingDocument(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="author_ids"
            label="Tác giả"
            rules={[{ required: true, message: 'Vui lòng chọn tác giả' }]}
          >
            <Select mode="multiple">
              {authors.map(author => (
                <Option key={author.id} value={author.id}>{author.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tag_ids"
            label="Thể loại"
          >
            <Select mode="multiple">
              {tags.map(tag => (
                <Option key={tag.id} value={tag.id}>{tag.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="publisher_id"
            label="Nhà xuất bản"
          >
            <Select>
              {publishers.map(pub => (
                <Option key={pub.id} value={pub.id}>{pub.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="language"
            label="Ngôn ngữ"
            rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
          >
            <Select>
              {languages.map(lang => (
                <Option key={lang.code} value={lang.code}>
                  {lang.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="publication_year"
            label="Năm xuất bản"
          >
            <Input type="number" min={1800} max={new Date().getFullYear()} />
          </Form.Item>

          <Form.Item
            name="isbn"
            label="ISBN"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="access_level"
            label="Quyền truy cập"
            rules={[{ required: true, message: 'Vui lòng chọn quyền truy cập' }]}
          >
            <Select>
              <Option value="public">Công khai</Option>
              <Option value="private">Riêng tư</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        title="Upload tài liệu mới"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          uploadForm.resetFields();
        }}
        footer={null}
        width={800}
        maskClosable={false}
      >
        <Spin spinning={uploading} tip="Đang upload và xử lý tài liệu..." size="large" style={{ minHeight: 300 }}>
          <Form
            form={uploadForm}
            layout="vertical"
            onFinish={handleUpload}
            className="upload-form-container"
          >
            <div className="upload-form-full-width">
              <Form.Item
                name="file"
                label="File tài liệu"
                rules={[{ required: true, message: 'Vui lòng chọn file tài liệu' }]}
              >
                <Dragger
                  accept=".pdf,.doc,.docx,.txt"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={({ fileList }) => {
                    uploadForm.setFieldsValue({ file: fileList });
                  }}
                  disabled={uploading}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click hoặc kéo thả file vào đây để upload</p>
                  <p className="ant-upload-hint">
                    Hỗ trợ các định dạng: PDF, DOC, DOCX, TXT
                  </p>
                </Dragger>
              </Form.Item>

              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input disabled={uploading} />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
              >
                <TextArea rows={4} disabled={uploading} />
              </Form.Item>
            </div>

            <Form.Item
              name="category_id"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select disabled={uploading}>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="author_ids"
              label="Tác giả"
              rules={[{ required: true, message: 'Vui lòng chọn tác giả' }]}
            >
              <Select mode="multiple" disabled={uploading}>
                {authors.map(author => (
                  <Option key={author.id} value={author.id}>{author.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="tag_ids"
              label="Thể loại"
            >
              <Select mode="multiple" disabled={uploading}>
                {tags.map(tag => (
                  <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="publisher_id"
              label="Nhà xuất bản"
            >
              <Select disabled={uploading}>
                {publishers.map(pub => (
                  <Option key={pub.id} value={pub.id}>{pub.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="language"
              label="Ngôn ngữ"
              rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
            >
              <Select disabled={uploading}>
                {languages.map(lang => (
                  <Option key={lang.code} value={lang.code}>
                    {lang.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="access_level"
              label="Quyền truy cập"
              rules={[{ required: true, message: 'Vui lòng chọn quyền truy cập' }]}
            >
              <Select disabled={uploading}>
                <Option value="public">Công khai</Option>
                <Option value="private">Riêng tư</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="version"
              label="Phiên bản"
              initialValue="1.0"
            >
              <Input disabled={uploading} />
            </Form.Item>

            <Form.Item
              name="publication_year"
              label="Năm xuất bản"
            >
              <Input type="number" min={1800} max={new Date().getFullYear()} disabled={uploading} />
            </Form.Item>

            <Form.Item
              name="isbn"
              label="ISBN"
            >
              <Input disabled={uploading} />
            </Form.Item>

            <div className="upload-form-full-width">
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>
                  Upload
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default AdminDashboard; 