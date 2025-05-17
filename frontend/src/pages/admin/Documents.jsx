import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag, Tooltip, Upload, Image, Switch, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined, FileTextOutlined, EyeOutlined, InboxOutlined, PlusOutlined, SearchOutlined, UserOutlined, FolderOutlined, ShopOutlined, CalendarOutlined } from '@ant-design/icons';
import api, { endpoints, getApiUrl } from '../../api/api';
import './Documents.css';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

// Helper function to get full image URL
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  // Remove /api prefix if it exists in the image URL
  const cleanUrl = imageUrl.startsWith('/api') ? imageUrl.substring(4) : imageUrl;
  return `${import.meta.env.VITE_API_URL}${cleanUrl}`;
};

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [form] = Form.useForm();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [tags, setTags] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [referenceModalVisible, setReferenceModalVisible] = useState(false);
  const [referenceType, setReferenceType] = useState(null);
  const [referenceForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

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

  // Fetch reference data (categories, languages, authors, tags, publishers)
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

      // Fetch authors
      try {
        const authorsRes = await api.get(endpoints.authors.list);
        setAuthors(authorsRes.data || []);
      } catch (error) {
        console.error('Error fetching authors:', error);
        message.error('Không thể tải danh sách tác giả');
      }

      // Fetch tags
      try {
        const tagsRes = await api.get(endpoints.tags.list);
        setTags(tagsRes.data || []);
      } catch (error) {
        console.error('Error fetching tags:', error);
        message.error('Không thể tải danh sách thể loại');
      }

      // Fetch publishers
      try {
        const publishersRes = await api.get(endpoints.publishers.list);
        setPublishers(publishersRes.data || []);
      } catch (error) {
        console.error('Error fetching publishers:', error);
        message.error('Không thể tải danh sách nhà xuất bản');
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
      is_featured: record.is_featured,
      author_ids: record.authors ? record.authors.map(a => a.id) : [],
      tag_ids: record.tags ? record.tags.map(tag => tag.id) : [],
      publisher_id: record.publisher_id
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
    // Kiểm tra các trường bắt buộc
    if (!values.title || !values.category_id || !values.author_ids || !values.language) {
      message.error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }

    // Kiểm tra ISBN hợp lệ (cho phép số và dấu gạch ngang, độ dài 10-20 ký tự)
    if (values.isbn && !/^[0-9-]{10,20}$/.test(values.isbn)) {
      message.error('ISBN không hợp lệ! Chỉ cho phép số và dấu gạch ngang, độ dài 10-20 ký tự.');
      return;
    }

    // Đảm bảo tag_ids là mảng id
    if (values.tag_ids && !Array.isArray(values.tag_ids)) {
      message.error('Thể loại không hợp lệ!');
      return;
    }

    // Làm sạch dữ liệu
    const cleanValues = { ...values };
    // Xóa các trường không hợp lệ
    delete cleanValues.file;
    delete cleanValues.image;

    // Xóa các trường undefined/null
    Object.keys(cleanValues).forEach(key => {
      if (cleanValues[key] === undefined || cleanValues[key] === null) {
        delete cleanValues[key];
      }
    });

    // Kiểm tra lại lần cuối
    console.log('Dữ liệu gửi lên:', cleanValues);

    try {
      if (editingDocument) {
        await api.put(endpoints.documents.update(editingDocument.id), cleanValues);
        message.success('Cập nhật tài liệu thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingDocument(null);
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document:', error, error.response?.data);
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        // In log chi tiết từng lỗi
        console.log('Chi tiết lỗi:', detail);
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
      // Kiểm tra fileList là mảng và có phần tử
      if (!Array.isArray(values.file) || !values.file[0] || !values.file[0].originFileObj) {
        message.error('Vui lòng chọn file để upload');
        setUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append('file', values.file[0].originFileObj);

      // Tạo object chứa dữ liệu document
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

      // Thêm authors và tags dưới dạng mảng JSON
      if (values.author_ids && values.author_ids.length) {
        formData.append('authors', JSON.stringify(values.author_ids));
      }
      if (values.tag_ids && values.tag_ids.length) {
        formData.append('tags', JSON.stringify(values.tag_ids));
      }

      // Thêm tất cả các trường từ documentData vào formData
      Object.keys(documentData).forEach(key => {
        if (documentData[key] !== undefined && documentData[key] !== null) {
          formData.append(key, documentData[key]);
        }
      });

      // In log dữ liệu form để kiểm tra
      console.log('Upload form values:', values);
      console.log('Document data:', documentData);
      for (let pair of formData.entries()) {
        console.log(pair[0]+ ':', pair[1]);
      }

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
    } finally {
      setUploading(false);
    }
  };

  // Add new reference item handler
  const handleAddReference = (type) => {
    setReferenceType(type);
    setReferenceModalVisible(true);
  };

  // Handle reference item creation
  const handleCreateReference = async (values) => {
    try {
      let endpoint;
      let payload = values;
      switch (referenceType) {
        case 'category':
          endpoint = endpoints.categories.create;
          // Chỉ cần name
          payload = { name: values.name };
          break;
        case 'author':
          endpoint = endpoints.authors.create;
          // Chỉ cần name, có thể mở rộng thêm các trường khác nếu muốn
          payload = { name: values.name };
          break;
        case 'tag':
          endpoint = endpoints.tags.create;
          // Có thể có name và description
          payload = { name: values.name, description: values.description };
          break;
        case 'publisher':
          endpoint = endpoints.publishers.create;
          // Có thể có name, description
          payload = { name: values.name, description: values.description };
          break;
        case 'language':
          endpoint = endpoints.languages.create;
          // Cần code và name
          payload = { code: values.code, name: values.name };
          break;
        default:
          throw new Error('Invalid reference type');
      }

      await api.post(endpoint, payload);
      message.success('Thêm mới thành công');
      setReferenceModalVisible(false);
      referenceForm.resetFields();
      fetchReferenceData(); // Refresh reference data
    } catch (error) {
      console.error('Error creating reference:', error);
      message.error('Không thể thêm mới');
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm, dataIndex) => {
    clearFilters();
    setSearchText('');
    confirm();
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm kiếm ${title.toLowerCase()}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  // Columns must be inside the component to access handlers
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
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('title', 'Tiêu đề'),
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <span>{text}</span>
            {record.status === 'INACTIVE' && <Tag color="red">Không hoạt động</Tag>}
          </Space>
          {record.code && (
            <Space size="small">
              <Tag color="blue">{record.code}</Tag>
            </Space>
          )}
        </Space>
      )
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description', 
      width: 240,
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: 'Tác giả',
      key: 'authors',
      width: 150,
      sorter: (a, b) => {
        const aAuthors = a.authors?.map(a => a.name).join(', ') || '';
        const bAuthors = b.authors?.map(a => a.name).join(', ') || '';
        return aAuthors.localeCompare(bAuthors);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('authors.name', 'Tác giả'),
      render: (_, record) => record.authors?.length > 0 ? (
        <Space direction="vertical" size="small">
          {record.authors.map(author => (
            <Space key={author.id} size="small">
              <UserOutlined />
              <span>{author.name}</span>
            </Space>
          ))}
        </Space>
      ) : '-'
    },
    {
      title: 'Thể loại',
      key: 'tags',
      width: 150,
      sorter: (a, b) => {
        const aTags = a.tags?.map(t => t.name).join(', ') || '';
        const bTags = b.tags?.map(t => t.name).join(', ') || '';
        return aTags.localeCompare(bTags);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('tags.name', 'Thể loại'),
      render: (_, record) => {
        const tags = record.tags || [];
        if (!tags.length) return '-';
        
        // Hiển thị tối đa 3 thể loại, nếu có thêm thì hiển thị +n
        const displayCount = 3;
        const displayTags = tags.slice(0, displayCount);
        const remainingCount = tags.length - displayCount;
        
        return (
          <Tooltip 
            title={tags.map(t => t.name).join(', ')}
            mouseEnterDelay={0.5}
          >
            <Space size={[0, 4]} wrap>
              {displayTags.map(tag => (
                <Tag key={tag.id} color="green">
                  {tag.name}
                </Tag>
              ))}
              {remainingCount > 0 && (
                <Tag color="default">+{remainingCount}</Tag>
              )}
            </Space>
          </Tooltip>
        );
      }
    },
    {
      title: 'Nhà xuất bản',
      key: 'publisher',
      width: 150,
      sorter: (a, b) => {
        const aPublisher = a.publisher?.name || '';
        const bPublisher = b.publisher?.name || '';
        return aPublisher.localeCompare(bPublisher);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('publisher.name', 'Nhà xuất bản'),
      render: (_, record) => record.publisher ? (
        <Space>
          <ShopOutlined />
          <span>{record.publisher.name}</span>
        </Space>
      ) : '-'
    },
    {
      title: 'Danh mục',
      key: 'categories',
      width: 150,
      sorter: (a, b) => {
        const aCategories = a.categories?.map(c => c.name).join(', ') || '';
        const bCategories = b.categories?.map(c => c.name).join(', ') || '';
        return aCategories.localeCompare(bCategories);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('categories.name', 'Danh mục'),
      render: (_, record) => record.categories?.length > 0 ? (
        <Space direction="vertical" size="small">
          {record.categories.map(category => (
            <Space key={category.id} size="small">
              <FolderOutlined />
              <span>{category.name}</span>
            </Space>
          ))}
        </Space>
      ) : '-'
    },
    {
      title: 'Ngôn ngữ',
      key: 'language',
      width: 110,
      sorter: (a, b) => {
        const aLanguage = a.language_rel?.name || a.language || '';
        const bLanguage = b.language_rel?.name || b.language || '';
        return aLanguage.localeCompare(bLanguage);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('language_rel.name', 'Ngôn ngữ'),
      render: (_, record) => record.language_rel?.name || record.language || '-'
    },
    {
      title: 'Ngày xuất bản',
      key: 'publication_date',
      width: 120,
      sorter: (a, b) => {
        const aDate = a.publication_date || '';
        const bDate = b.publication_date || '';
        return aDate.localeCompare(bDate);
      },
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => record.publication_date ? (
        <Space>
          <CalendarOutlined />
          <span>{dayjs(record.publication_date).format('DD/MM/YYYY')}</span>
        </Space>
      ) : '-'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 110,
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortDirections: ['ascend', 'descend'],
      filters: [
        { text: 'Hoạt động', value: 'ACTIVE' },
        { text: 'Không hoạt động', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const statusColors = {
          'ACTIVE': 'green',
          'INACTIVE': 'red'
        };
        return <Tag color={statusColors[record.status] || 'default'}>{record.status}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
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
            {/* Full width items */}
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

            {/* Two column items */}
            <Form.Item
              name="category_id"
              label={
                <div className="reference-field-header">
                  <span>Danh mục</span>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<PlusOutlined />}
                    onClick={() => handleAddReference('category')}
                  >
                    Thêm mới
                  </Button>
                </div>
              }
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="author_ids"
              label={
                <div className="reference-field-header">
                  <span>Tác giả</span>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<PlusOutlined />}
                    onClick={() => handleAddReference('author')}
                  >
                    Thêm mới
                  </Button>
                </div>
              }
              rules={[{ required: true, message: 'Vui lòng chọn tác giả' }]}
            >
              <Select
                mode="multiple"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {authors.map(author => (
                  <Option key={author.id} value={author.id}>{author.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="tag_ids"
              label={
                <div className="reference-field-header">
                  <span>Thể loại</span>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<PlusOutlined />}
                    onClick={() => handleAddReference('tag')}
                  >
                    Thêm mới
                  </Button>
                </div>
              }
            >
              <Select
                mode="multiple"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {tags.map(tag => (
                  <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="publisher_id"
              label={
                <div className="reference-field-header">
                  <span>Nhà xuất bản</span>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<PlusOutlined />}
                    onClick={() => handleAddReference('publisher')}
                  >
                    Thêm mới
                  </Button>
                </div>
              }
            >
              <Select
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {publishers.map(pub => (
                  <Option key={pub.id} value={pub.id}>{pub.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="language"
              label={
                <div className="reference-field-header">
                  <span>Ngôn ngữ</span>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<PlusOutlined />}
                    onClick={() => handleAddReference('language')}
                  >
                    Thêm mới
                  </Button>
                </div>
              }
              rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
            >
              <Select
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
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

            <div className="upload-form-full-width">
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>
                  Upload
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Spin>

        {/* Reference Item Creation Modal */}
        <Modal
          title={`Thêm mới ${referenceType === 'category' ? 'danh mục' : 
            referenceType === 'author' ? 'tác giả' :
            referenceType === 'tag' ? 'thể loại' :
            referenceType === 'publisher' ? 'nhà xuất bản' :
            'ngôn ngữ'}`}
          open={referenceModalVisible}
          onCancel={() => {
            setReferenceModalVisible(false);
            referenceForm.resetFields();
          }}
          onOk={() => referenceForm.submit()}
        >
          <Form
            form={referenceForm}
            layout="vertical"
            onFinish={handleCreateReference}
          >
            {referenceType === 'language' ? (
              <>
                <Form.Item
                  name="code"
                  label="Mã ngôn ngữ"
                  rules={[{ required: true, message: 'Vui lòng nhập mã ngôn ngữ' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="Tên ngôn ngữ"
                  rules={[{ required: true, message: 'Vui lòng nhập tên ngôn ngữ' }]}
                >
                  <Input />
                </Form.Item>
              </>
            ) : referenceType === 'tag' ? (
              <>
                <Form.Item
                  name="name"
                  label="Tên thể loại"
                  rules={[{ required: true, message: 'Vui lòng nhập tên thể loại' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Mô tả"
                >
                  <Input />
                </Form.Item>
              </>
            ) : referenceType === 'publisher' ? (
              <>
                <Form.Item
                  name="name"
                  label="Tên nhà xuất bản"
                  rules={[{ required: true, message: 'Vui lòng nhập tên nhà xuất bản' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Mô tả"
                >
                  <Input />
                </Form.Item>
              </>
            ) : (
              <Form.Item
                name="name"
                label={`Tên ${referenceType === 'category' ? 'danh mục' : 'tác giả'}`}
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input />
              </Form.Item>
            )}
          </Form>
        </Modal>
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
              <p><strong>Tác giả:</strong> {selectedDocument.authors?.map(a => a.name).join(', ') || 'Không có'}</p>
              <p><strong>Thể loại:</strong> {selectedDocument.tags?.map(tag => tag.name).join(', ') || 'Không có'}</p>
              <p><strong>Nhà xuất bản:</strong> {selectedDocument.publisher?.name || 'Không có'}</p>
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