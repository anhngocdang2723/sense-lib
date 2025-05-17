import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, BookOutlined, GlobalOutlined, MailOutlined, PhoneOutlined, HomeOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api, { endpoints } from '../../api/api';
import './Publishers.css';
import Highlighter from 'react-highlight-words';

const { TextArea } = Input;
const { Option } = Select;

const AdminPublishers = () => {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const fetchPublishers = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.publishers.list);
      setPublishers((response.data || []).map(pub => ({ ...pub, key: pub.id })));
    } catch (error) {
      console.error('Error fetching publishers:', error);
      message.error('Không thể tải danh sách nhà xuất bản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, []);

  const handleEdit = (record) => {
    setEditingPublisher(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      website: record.website,
      email: record.email,
      phone: record.phone,
      address: record.address,
      status: record.status
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await api.delete(endpoints.publishers.delete(id));
      if (response.data?.status === 'deactivated') {
        message.success('Nhà xuất bản đã được chuyển sang trạng thái không hoạt động');
      } else if (response.data?.status === 'deleted') {
        message.success('Nhà xuất bản đã được xóa vĩnh viễn');
      } else {
        message.success(response.data?.message || 'Xóa nhà xuất bản thành công');
      }
      fetchPublishers();
    } catch (error) {
      console.error('Error deleting publisher:', error);
      const errorMessage = error.response?.data?.detail || 'Không thể xóa nhà xuất bản';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      let response;
      if (editingPublisher) {
        response = await api.put(endpoints.publishers.update(editingPublisher.id), values);
        message.success('Cập nhật nhà xuất bản thành công');
      } else {
        response = await api.post(endpoints.publishers.create, values);
        message.success('Thêm nhà xuất bản mới thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingPublisher(null);
      fetchPublishers();
    } catch (error) {
      console.error('Error saving publisher:', error);
      const errorMessage = error.response?.data?.detail || 'Không thể lưu thông tin nhà xuất bản';
      message.error(errorMessage);
    } finally {
      setSubmitLoading(false);
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

  const columns = [
    {
      title: 'Tên nhà xuất bản',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('name', 'Tên nhà xuất bản'),
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
      ellipsis: true,
      sorter: (a, b) => {
        const aDesc = a.description || '';
        const bDesc = b.description || '';
        return aDesc.localeCompare(bDesc);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('description', 'Mô tả'),
      render: (text) => text || '-'
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      sorter: (a, b) => {
        const aAddress = a.address || '';
        const bAddress = b.address || '';
        return aAddress.localeCompare(bAddress);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('address', 'Địa chỉ'),
      render: (_, record) => record.address ? (
        <Space>
          <EnvironmentOutlined />
          <span>{record.address}</span>
        </Space>
      ) : '-'
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
      title: 'Email',
      key: 'email',
      sorter: (a, b) => {
        const aEmail = a.email || '';
        const bEmail = b.email || '';
        return aEmail.localeCompare(bEmail);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('email', 'Email'),
      render: (_, record) => record.email ? (
        <Space>
          <MailOutlined />
          <span>{record.email}</span>
        </Space>
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
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} disabled={loading || submitLoading} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa nhà xuất bản này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
              disabled={loading || submitLoading}
            >
              <Button danger icon={<DeleteOutlined />} disabled={loading || submitLoading} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="admin-publishers">
      <div className="admin-publishers-header">
        <h1>Quản lý nhà xuất bản</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditingPublisher(null);
            form.resetFields();
            setModalVisible(true);
          }}
          disabled={loading || submitLoading}
        >
          Thêm nhà xuất bản mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={publishers}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        locale={{ emptyText: 'Không có nhà xuất bản nào' }}
      />

      <Modal
        title={editingPublisher ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuất bản mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingPublisher(null);
        }}
        footer={null}
        width={800}
        className="publisher-modal"
        maskClosable={false}
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên nhà xuất bản"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà xuất bản' }]}
          >
            <Input prefix={<BookOutlined />} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
            rules={[{ type: 'url', message: 'URL không hợp lệ' }]}
          >
            <Input prefix={<GlobalOutlined />} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Điện thoại"
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input prefix={<HomeOutlined />} />
          </Form.Item>

          {editingPublisher && (
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select>
                <Option value="ACTIVE">Hoạt động</Option>
                <Option value="INACTIVE">Không hoạt động</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingPublisher(null);
                }}
                disabled={submitLoading}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {editingPublisher ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPublishers; 