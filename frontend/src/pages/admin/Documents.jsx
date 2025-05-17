import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag, Tooltip, Upload, Image, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import api, { endpoints, getApiUrl } from '../../api/api';
import './Documents.css';

const { Option } = Select;
const { TextArea } = Input;

// Helper function to get full image URL
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  // Remove /api prefix if it exists in the image URL
  const cleanUrl = imageUrl.startsWith('/api') ? imageUrl.substring(4) : imageUrl;
  return `${import.meta.env.VITE_API_URL}${cleanUrl}`;
};

const columns = [
  {
    title: 'Ảnh bìa',
    key: 'image_url',
    width: 100,
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
    render: (text, record) => (
      <Space>
        <span>{text}</span>
        {record.is_featured && <Tag color="gold">Nổi bật</Tag>}
      </Space>
    )
  },
  { 
    title: 'Mô tả', 
    dataIndex: 'description', 
    key: 'description', 
    ellipsis: true,
    render: (text) => text || '-'
  },
  {
    title: 'Danh mục',
    key: 'category',
    render: (_, record) => record.category?.name || '-'
  },
  {
    title: 'Ngôn ngữ',
    key: 'language',
    render: (_, record) => record.language_rel?.name || record.language || '-'
  },
  {
    title: 'Trạng thái',
    key: 'status',
    render: (_, record) => {
      const statusColors = {
        'PENDING': 'orange',
        'PROCESSING': 'blue',
        'AVAILABLE': 'green',
        'REJECTED': 'red'
      };
      return <Tag color={statusColors[record.status] || 'default'}>{record.status}</Tag>;
    }
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 200,
    render: (_, record) => (
      <Space>
        <Tooltip title="Xem chi tiết">
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
        </Tooltip>
        <Tooltip title="Chỉnh sửa">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        </Tooltip>
        <Tooltip title="Xóa">
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài liệu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Tooltip>
      </Space>
    )
  }
];

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [form] = Form.useForm();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.documents.list);
      console.log('Documents response:', response.data);
      setDocuments(response.data.documents || response.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      message.error('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reference data (categories, languages only)
  const fetchReferenceData = async () => {
    try {
      console.log('Fetching reference data...');
      
      // Fetch categories
      try {
        const categoriesRes = await api.get(endpoints.categories.list);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Không thể tải danh sách danh mục');
      }

      // Fetch languages
      try {
        const languagesRes = await api.get(endpoints.languages.list);
        setLanguages(languagesRes.data || []);
      } catch (error) {
        console.error('Error fetching languages:', error);
        message.error('Không thể tải danh sách ngôn ngữ');
      }

    } catch (error) {
      console.error('Error in fetchReferenceData:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchReferenceData();
  }, []);

  // Handle view details
  const handleViewDetails = (record) => {
    setSelectedDocument(record);
    setDetailsModalVisible(true);
  };

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
      is_featured: record.is_featured
    });
    setModalVisible(true);
  };

  // Handle document delete
  const handleDelete = async (id) => {
    try {
      await api.delete(endpoints.documents.delete(id));
      message.success('Xóa tài liệu thành công');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      message.error('Không thể xóa tài liệu');
    }
  };

  // Handle document update
  const handleSubmit = async (values) => {
    try {
      if (editingDocument) {
        await api.put(endpoints.documents.update(editingDocument.id), values);
        message.success('Cập nhật tài liệu thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingDocument(null);
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      message.error('Không thể cập nhật tài liệu');
    }
  };

  // Handle document upload
  const handleUpload = async (values) => {
    try {
      // Kiểm tra fileList là mảng và có phần tử
      if (!Array.isArray(values.file) || !values.file[0] || !values.file[0].originFileObj) {
        message.error('Vui lòng chọn file để upload');
        return;
      }
      const formData = new FormData();
      formData.append('file', values.file[0].originFileObj);

      // Thêm các trường khác như cũ
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('category_id', values.category_id);
      formData.append('language', values.language);
      formData.append('access_level', values.access_level);
      formData.append('version', values.version || '1.0');
      if (values.publication_year) formData.append('publication_year', values.publication_year);
      if (values.isbn) formData.append('isbn', values.isbn);

      const response = await api.post(endpoints.documents.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        message.success('Upload tài liệu thành công!');
        setUploadModalVisible(false);
        uploadForm.resetFields();
        fetchDocuments();
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.message ||
        'Upload tài liệu thất bại!';
      message.error(errorMessage);
    }
  };

  return (
    <div className="admin-documents">
      <div className="admin-documents-header">
        <h1>Quản lý tài liệu</h1>
        <Button type="primary" onClick={() => setUploadModalVisible(true)}>
          Upload tài liệu mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={documents}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        locale={{ emptyText: 'Không có tài liệu nào' }}
      />

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
        <Form form={form} onFinish={handleSubmit} layout="vertical">
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

          <Form.Item
            name="is_featured"
            label="Nổi bật"
            valuePropName="checked"
          >
            <Switch />
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
        width={600}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUpload}
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
            name="file"
            label="File"
            rules={[{ required: true, message: 'Vui lòng chọn file' }]}
            valuePropName="fileList"
            getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.doc,.docx,.txt"
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
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
            name="access_level"
            label="Quyền truy cập"
            rules={[{ required: true, message: 'Vui lòng chọn quyền truy cập' }]}
          >
            <Select>
              <Option value="public">Công khai</Option>
              <Option value="private">Riêng tư</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="version"
            label="Phiên bản"
            initialValue="1.0"
          >
            <Input />
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

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Modal>

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
              <p><strong>Ngôn ngữ:</strong> {selectedDocument.language_rel?.name || selectedDocument.language || 'Không có'}</p>
              <p><strong>Năm xuất bản:</strong> {selectedDocument.publication_year || 'Không có'}</p>
              <p><strong>ISBN:</strong> {selectedDocument.isbn || 'Không có'}</p>
              <p><strong>Phiên bản:</strong> {selectedDocument.version}</p>
              <p><strong>Trạng thái:</strong> {selectedDocument.status}</p>
              <p><strong>Quyền truy cập:</strong> {selectedDocument.access_level}</p>
              <p><strong>Người thêm:</strong> {selectedDocument.added_by_user?.full_name || 'Không có'}</p>
              <p><strong>Ngày thêm:</strong> {new Date(selectedDocument.created_at).toLocaleString()}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDocuments; 