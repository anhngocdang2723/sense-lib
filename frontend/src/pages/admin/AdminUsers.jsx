import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag, Tooltip, Switch, Spin, Card } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UnlockOutlined, SearchOutlined, PlusOutlined, CheckCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import api, { endpoints } from '../../api/api';
import './AdminUsers.css';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.users.list);
      const userList = response.data.users || [];
      setUsers(userList);
      
      // Calculate stats
      setStats({
        total: userList.length,
        active: userList.filter(u => u.is_active).length,
        inactive: userList.filter(u => !u.is_active).length,
        verified: userList.filter(u => u.is_verified).length,
        unverified: userList.filter(u => !u.is_verified).length
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user edit
  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      email: record.email,
      username: record.username,
      full_name: record.full_name,
      phone_number: record.phone_number,
      address: record.address,
      role: record.role,
      is_active: record.is_active,
      score: record.score
    });
    setModalVisible(true);
  };

  // Handle user status update
  const handleStatusChange = async (userId, isActive) => {
    try {
      await api.put(`${endpoints.users.updateStatus(userId)}?is_active=${isActive.toString()}`);
      message.success(`Cập nhật trạng thái người dùng thành công`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('Không thể cập nhật trạng thái người dùng');
    }
  };

  // Handle user role update
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`${endpoints.users.updateRole(userId)}?new_role=${newRole}`);
      message.success('Cập nhật vai trò người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      message.error('Không thể cập nhật vai trò người dùng');
    }
  };

  // Handle user update
  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        let hasChanges = false;

        // Update role if changed
        if (values.role !== editingUser.role) {
          await api.put(`${endpoints.users.updateRole(editingUser.id)}?new_role=${values.role}`);
          hasChanges = true;
        }

        // Update status if changed
        if (values.is_active !== editingUser.is_active) {
          const isActive = values.is_active === undefined ? false : values.is_active;
          await api.put(`${endpoints.users.updateStatus(editingUser.id)}?is_active=${isActive}`);
          hasChanges = true;
        }

        // Update other fields if changed
        const updateData = {};
        if (values.email !== editingUser.email) updateData.email = values.email;
        if (values.username !== editingUser.username) updateData.username = values.username;
        if (values.full_name !== editingUser.full_name) updateData.full_name = values.full_name;
        if (values.phone_number !== editingUser.phone_number) updateData.phone_number = values.phone_number || null;
        if (values.address !== editingUser.address) updateData.address = values.address || null;

        // If no fields have changed, show message and return
        if (!hasChanges && Object.keys(updateData).length === 0) {
          message.info('Không có thông tin nào được thay đổi');
          return;
        }

        // Update other fields using admin endpoint
        if (Object.keys(updateData).length > 0) {
          console.log('Sending update data:', updateData);
          const response = await api.put(endpoints.users.update(editingUser.id), updateData);
          console.log('Update response:', response.data);
        }
        
        message.success('Cập nhật thông tin người dùng thành công');
      } else {
        await api.post(endpoints.users.create, values);
        message.success('Thêm người dùng mới thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      console.error('Error response:', error.response?.data);
      message.error(error.response?.data?.detail || 'Không thể cập nhật thông tin người dùng');
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
  });

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('email', 'Email'),
      render: (text) => (
        <Space>
          <MailOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('username', 'Tên đăng nhập'),
      render: (text) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Họ tên',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 200,
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('full_name', 'Họ tên')
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone_number',
      key: 'phone_number',
      width: 150,
      render: (text) => text ? (
        <Space>
          <PhoneOutlined />
          <span>{text}</span>
        </Space>
      ) : '-'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      filters: [
        { text: 'Admin', value: 'ADMIN' },
        { text: 'Member', value: 'MEMBER' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => (
        <Select
          value={role}
          style={{ width: '100%' }}
          onChange={(value) => handleRoleChange(editingUser?.id, value)}
          disabled={!editingUser}
        >
          <Option value="ADMIN">Admin</Option>
          <Option value="MEMBER">Member</Option>
        </Select>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Không hoạt động', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren={<LockOutlined />}
          unCheckedChildren={<UnlockOutlined />}
        />
      )
    },
    {
      title: 'Xác thực',
      dataIndex: 'is_verified',
      key: 'is_verified',
      width: 120,
      render: (isVerified) => (
        <Tag color={isVerified ? 'green' : 'red'}>
          {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
        </Tag>
      )
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      sorter: (a, b) => a.score - b.score,
      sortDirections: ['ascend', 'descend'],
      render: (score) => (
        <Tag color="blue">{score || 0}</Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      sortDirections: ['ascend', 'descend'],
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  const statCards = [
    {
      title: 'Tổng số người dùng',
      value: stats.total,
      icon: <UserOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Đang hoạt động',
      value: stats.active,
      icon: <LockOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Không hoạt động',
      value: stats.inactive,
      icon: <UnlockOutlined />,
      color: '#ff4d4f'
    },
    {
      title: 'Đã xác thực',
      value: stats.verified,
      icon: <CheckCircleOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Điểm trung bình',
      value: users.length > 0 ? Math.round(users.reduce((acc, user) => acc + (user.score || 0), 0) / users.length) : 0,
      icon: <TrophyOutlined />,
      color: '#faad14'
    }
  ];

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <h1>Quản lý người dùng</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm người dùng mới
        </Button>
      </div>

      <div className="stats-cards">
        {statCards.map((card, idx) => (
          <Card key={idx} className="stat-card">
            <div className="stat-card-content">
              <div className="stat-card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="stat-card-info">
                <div className="stat-card-title">{card.title}</div>
                <div className="stat-card-value">{card.value}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          scroll={{ x: true }}
          locale={{ emptyText: 'Không có người dùng nào' }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} người dùng`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title={editingUser ? "Chỉnh sửa thông tin người dùng" : "Thêm người dùng mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone_number"
            label="Số điện thoại"
            rules={[
              { pattern: /^\+?[0-9]{8,15}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="score"
            label="Điểm"
            rules={[{ type: 'number', message: 'Điểm phải là số' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select>
              <Option value="ADMIN">Admin</Option>
              <Option value="MEMBER">Member</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUser ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers; 