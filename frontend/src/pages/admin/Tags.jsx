import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, TagsOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import api, { endpoints } from '../../api/api';
import './Tags.css';
import Highlighter from 'react-highlight-words';

const { TextArea } = Input;
const { Option } = Select;

const AdminTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.tags.list);
      setTags((response.data || []).map(tag => ({ ...tag, key: tag.id })));
    } catch (error) {
      console.error('Error fetching tags:', error);
      message.error('Không thể tải danh sách thể loại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleEdit = (record) => {
    setEditingTag(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      status: record.status
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await api.delete(endpoints.tags.delete(id));
      if (response.data?.status === 'deactivated') {
        message.success('Thể loại đã được chuyển sang trạng thái không hoạt động');
      } else if (response.data?.status === 'deleted') {
        message.success('Thể loại đã được xóa vĩnh viễn');
      } else {
        message.success(response.data?.message || 'Xóa thể loại thành công');
      }
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      const errorMessage = error.response?.data?.detail || 'Không thể xóa thể loại';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      let response;
      if (editingTag) {
        response = await api.put(endpoints.tags.update(editingTag.id), values);
        message.success('Cập nhật thể loại thành công');
      } else {
        response = await api.post(endpoints.tags.create, values);
        message.success('Thêm thể loại mới thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTag(null);
      fetchTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      const errorMessage = error.response?.data?.detail || 'Không thể lưu thông tin thể loại';
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
      title: 'Tên thẻ', 
      dataIndex: 'name', 
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('name', 'Tên thẻ'),
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
      title: 'Số lượng tài liệu',
      key: 'document_count',
      sorter: (a, b) => (a.document_count || 0) - (b.document_count || 0),
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => (
        <Space>
          <FileTextOutlined />
          <span>{record.document_count || 0}</span>
        </Space>
      )
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
              title="Bạn có chắc chắn muốn xóa thể loại này?"
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
    <div className="admin-tags">
      <div className="admin-tags-header">
        <h1>Quản lý thể loại</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditingTag(null);
            form.resetFields();
            setModalVisible(true);
          }}
          disabled={loading || submitLoading}
        >
          Thêm thể loại mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tags}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        locale={{ emptyText: 'Không có thể loại nào' }}
      />

      {/* Edit/Create Tag Modal */}
      <Modal
        title={editingTag ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingTag(null);
        }}
        footer={null}
        width={600}
        className="tag-modal"
        maskClosable={false}
        destroyOnClose
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Tên thể loại"
            rules={[{ required: true, message: 'Vui lòng nhập tên thể loại' }]}
          >
            <Input prefix={<TagsOutlined />} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} />
          </Form.Item>

          {editingTag && (
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
                  setEditingTag(null);
                }}
                disabled={submitLoading}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {editingTag ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTags; 