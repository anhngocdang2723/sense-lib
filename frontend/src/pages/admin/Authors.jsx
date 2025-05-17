import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag, Tooltip, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, GlobalOutlined, CalendarOutlined, FlagOutlined, SearchOutlined } from '@ant-design/icons';
import api, { endpoints } from '../../api/api';
import './Authors.css';
import dayjs from 'dayjs';
import Highlighter from 'react-highlight-words';

const { TextArea } = Input;
const { Option } = Select;

const AdminAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  // Define columns inside component to access state and handlers
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

  const columns = [
    { 
      title: 'Tên tác giả', 
      dataIndex: 'name', 
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('name', 'Tên tác giả'),
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <span>{text}</span>
            {record.status === 'INACTIVE' && <Tag color="red">Không hoạt động</Tag>}
          </Space>
          {record.email && (
            <Space size="small">
              <MailOutlined />
              <span className="author-email">{record.email}</span>
            </Space>
          )}
        </Space>
      )
    },
    { 
      title: 'Thông tin cá nhân', 
      key: 'personal_info',
      sorter: (a, b) => {
        const aDate = a.birth_date || '';
        const bDate = b.birth_date || '';
        return aDate.localeCompare(bDate);
      },
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.birth_date && (
            <Space size="small">
              <CalendarOutlined />
              <span>Sinh: {dayjs(record.birth_date).format('DD/MM/YYYY')}</span>
            </Space>
          )}
          {record.death_date && (
            <Space size="small">
              <CalendarOutlined />
              <span>Mất: {dayjs(record.death_date).format('DD/MM/YYYY')}</span>
            </Space>
          )}
          {record.nationality && (
            <Space size="small">
              <FlagOutlined />
              <span>{record.nationality}</span>
            </Space>
          )}
        </Space>
      )
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'bio', 
      key: 'bio', 
      ellipsis: true,
      sorter: (a, b) => {
        const aBio = a.bio || '';
        const bBio = b.bio || '';
        return aBio.localeCompare(bBio);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('bio', 'Mô tả'),
      render: (text) => text || '-'
    },
    {
      title: 'Website',
      key: 'website',
      sorter: (a, b) => {
        const aWebsite = a.website || '';
        const bWebsite = b.website || '';
        return aWebsite.localeCompare(bWebsite);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('website', 'Website'),
      render: (_, record) => record.website ? (
        <a href={record.website} target="_blank" rel="noopener noreferrer">
          <Space>
            <GlobalOutlined />
            <span>Website</span>
          </Space>
        </a>
      ) : '-'
    },
    {
      title: 'Trạng thái',
      key: 'status',
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              disabled={loading || submitLoading}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa tác giả này?"
              description={record.status === 'ACTIVE' ? 
                "Tác giả đang hoạt động sẽ được chuyển sang trạng thái không hoạt động." : 
                "Tác giả sẽ bị xóa vĩnh viễn nếu không có tài liệu nào."}
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
              disabled={loading || submitLoading}
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
                disabled={loading || submitLoading}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // Fetch authors
  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.authors.list);
      // Ensure each author has a unique key
      const authorsWithKeys = (response.data || []).map(author => ({
        ...author,
        key: author.id // Add key for table
      }));
      setAuthors(authorsWithKeys);
    } catch (error) {
      console.error('Error fetching authors:', error);
      message.error('Không thể tải danh sách tác giả');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // Handle author edit
  const handleEdit = (record) => {
    console.log('Editing author:', record);
    setEditingAuthor(record);
    form.setFieldsValue({
      name: record.name,
      bio: record.bio,
      email: record.email,
      website: record.website,
      birth_date: record.birth_date ? dayjs(record.birth_date) : null,
      death_date: record.death_date ? dayjs(record.death_date) : null,
      nationality: record.nationality,
      status: record.status
    });
    setModalVisible(true);
  };

  // Handle author delete
  const handleDelete = async (id) => {
    try {
      console.log('Deleting author:', id);
      const response = await api.delete(endpoints.authors.delete(id));
      console.log('Delete response:', response);
      
      if (response.data?.status === 'deactivated') {
        message.success('Tác giả đã được chuyển sang trạng thái không hoạt động');
      } else if (response.data?.status === 'deleted') {
        message.success('Tác giả đã được xóa vĩnh viễn');
      } else {
        message.success(response.data?.message || 'Xóa tác giả thành công');
      }
      
      await fetchAuthors();
    } catch (error) {
      console.error('Error deleting author:', error);
      const errorMessage = error.response?.data?.detail || 'Không thể xóa tác giả';
      message.error(errorMessage);
    }
  };

  // Handle author create/update
  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      console.log('Submitting form values:', values);
      
      const submitData = {
        ...values,
        birth_date: values.birth_date?.format('YYYY-MM-DD'),
        death_date: values.death_date?.format('YYYY-MM-DD')
      };

      // Remove undefined and null values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined || submitData[key] === null) {
          delete submitData[key];
        }
      });

      console.log('Processed submit data:', submitData);

      let response;
      if (editingAuthor) {
        console.log('Updating author:', editingAuthor.id);
        response = await api.put(endpoints.authors.update(editingAuthor.id), submitData);
        console.log('Update response:', response);
        message.success('Cập nhật tác giả thành công');
      } else {
        console.log('Creating new author');
        response = await api.post(endpoints.authors.create, submitData);
        console.log('Create response:', response);
        message.success('Thêm tác giả mới thành công');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingAuthor(null);
      
      await fetchAuthors();
    } catch (error) {
      console.error('Error saving author:', error);
      const errorMessage = error.response?.data?.detail || 'Không thể lưu thông tin tác giả';
      message.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="admin-authors">
      <div className="admin-authors-header">
        <h1>Quản lý tác giả</h1>
        <Button 
          type="primary" 
          onClick={() => {
            setEditingAuthor(null);
            form.resetFields();
            setModalVisible(true);
          }}
          disabled={loading || submitLoading}
        >
          Thêm tác giả mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={authors}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        locale={{ emptyText: 'Không có tác giả nào' }}
      />

      <Modal
        title={editingAuthor ? "Chỉnh sửa tác giả" : "Thêm tác giả mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingAuthor(null);
        }}
        footer={null}
        width={800}
        className="author-modal"
        maskClosable={false}
        destroyOnClose
      >
        <Form 
          form={form} 
          onFinish={handleSubmit} 
          layout="vertical"
          className="author-form"
        >
          <div className="form-row">
            <Form.Item
              name="name"
              label="Tên tác giả"
              rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
              className="form-item-full"
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
              className="form-item-half"
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item
              name="website"
              label="Website"
              rules={[
                { type: 'url', message: 'URL không hợp lệ' }
              ]}
              className="form-item-half"
            >
              <Input prefix={<GlobalOutlined />} />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              name="birth_date"
              label="Ngày sinh"
              className="form-item-third"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>

            <Form.Item
              name="death_date"
              label="Ngày mất"
              className="form-item-third"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày mất"
              />
            </Form.Item>

            <Form.Item
              name="nationality"
              label="Quốc tịch"
              className="form-item-third"
            >
              <Input prefix={<FlagOutlined />} />
            </Form.Item>
          </div>

          <Form.Item
            name="bio"
            label="Tiểu sử"
            className="form-item-full"
          >
            <TextArea rows={4} />
          </Form.Item>

          {editingAuthor && (
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              className="form-item-full"
            >
              <Select>
                <Option value="ACTIVE">Hoạt động</Option>
                <Option value="INACTIVE">Không hoạt động</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item className="form-item-full form-actions">
            <Space>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingAuthor(null);
                }}
                disabled={submitLoading}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitLoading}
              >
                {editingAuthor ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminAuthors; 