import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, FolderOutlined, LinkOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import api, { endpoints } from '../../api/api';
import './Categories.css';
import Highlighter from 'react-highlight-words';

const { TextArea } = Input;
const { Option } = Select;

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.categories.list);
      const categoriesRaw = response.data || [];
      // Create a map from id to category
      const idMap = {};
      categoriesRaw.forEach(cat => { idMap[cat.id] = cat; });
      // Attach parent object for each category
      const categoriesWithParent = categoriesRaw.map(cat => ({
        ...cat,
        parent: cat.parent_id ? idMap[cat.parent_id] : null,
        key: cat.id
      }));
      setCategories(categoriesWithParent);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle category edit
  const handleEdit = (record) => {
    console.log('Editing category:', record);
    setEditingCategory(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      parent_id: record.parent_id,
      icon: record.icon,
      status: record.status
    });
    setModalVisible(true);
  };

  // Handle category delete
  const handleDelete = async (id) => {
    try {
      console.log('Deleting category:', id);
      const response = await api.delete(endpoints.categories.delete(id));
      console.log('Delete response:', response);
      
      if (response.data?.status === 'deactivated') {
        message.success('Danh mục đã được chuyển sang trạng thái không hoạt động');
      } else if (response.data?.status === 'deleted') {
        message.success('Danh mục đã được xóa vĩnh viễn');
      } else {
        message.success(response.data?.message || 'Xóa danh mục thành công');
      }
      
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.detail || 'Không thể xóa danh mục';
      message.error(errorMessage);
    }
  };

  // Handle category create/update
  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      console.log('Submitting form values:', values);
      
      const submitData = { ...values };

      // Remove undefined and null values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined || submitData[key] === null) {
          delete submitData[key];
        }
      });

      console.log('Processed submit data:', submitData);

      let response;
      if (editingCategory) {
        console.log('Updating category:', editingCategory.id);
        response = await api.put(endpoints.categories.update(editingCategory.id), submitData);
        console.log('Update response:', response);
        message.success('Cập nhật danh mục thành công');
      } else {
        console.log('Creating new category');
        response = await api.post(endpoints.categories.create, submitData);
        console.log('Create response:', response);
        message.success('Thêm danh mục mới thành công');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.detail || 'Không thể lưu thông tin danh mục';
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
          ref={searchInput}
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
    onFilter: (value, record) => {
      if (dataIndex.includes('.')) {
        const [parent, child] = dataIndex.split('.');
        return record[parent]?.[child]
          ? record[parent][child].toString().toLowerCase().includes(value.toLowerCase())
          : false;
      }
      return record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text, record) => {
      if (searchedColumn === dataIndex) {
        let textToHighlight = text;
        if (dataIndex.includes('.')) {
          const [parent, child] = dataIndex.split('.');
          textToHighlight = record[parent]?.[child] || '';
        }
        return (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={textToHighlight ? textToHighlight.toString() : ''}
          />
        );
      }
      return text;
    },
  });

  const columns = [
    { 
      title: 'Tên danh mục', 
      dataIndex: 'name', 
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('name', 'Tên danh mục'),
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <span>{text}</span>
            {record.status === 'INACTIVE' && <Tag color="red">Không hoạt động</Tag>}
          </Space>
          {record.slug && (
            <Space size="small">
              <LinkOutlined />
              <span className="category-slug">{record.slug}</span>
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
      title: 'Danh mục cha',
      key: 'parent',
      sorter: (a, b) => {
        const aParent = a.parent?.name || '';
        const bParent = b.parent?.name || '';
        return aParent.localeCompare(bParent);
      },
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('parent.name', 'Danh mục cha'),
      render: (_, record) => record.parent ? (
        <Space>
          <FolderOutlined />
          <span>{record.parent.name}</span>
        </Space>
      ) : '-'
    },
    {
      title: 'Biểu tượng',
      key: 'icon',
      render: (_, record) => record.icon ? (
        <Space>
          <FolderOutlined />
          <span>{record.icon}</span>
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
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              disabled={loading || submitLoading}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa danh mục này?"
              description={record.status === 'ACTIVE' ? 
                "Danh mục đang hoạt động sẽ được chuyển sang trạng thái không hoạt động." : 
                "Danh mục sẽ bị xóa vĩnh viễn nếu không có tài liệu nào."}
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

  return (
    <div className="admin-categories">
      <div className="admin-categories-header">
        <h1>Quản lý danh mục</h1>
        <Button 
          type="primary" 
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setModalVisible(true);
          }}
          disabled={loading || submitLoading}
        >
          Thêm danh mục mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        locale={{ emptyText: 'Không có danh mục nào' }}
      />

      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        footer={null}
        width={800}
        className="category-modal"
        maskClosable={false}
        destroyOnClose
      >
        <Form 
          form={form} 
          onFinish={handleSubmit} 
          layout="vertical"
          className="category-form"
        >
          <div className="form-row">
            <Form.Item
              name="name"
              label="Tên danh mục"
              rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
              className="form-item-full"
            >
              <Input prefix={<FolderOutlined />} />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              name="parent_id"
              label="Danh mục cha"
              className="form-item-half"
            >
              <Select
                allowClear
                placeholder="Chọn danh mục cha"
                showSearch
                optionFilterProp="children"
              >
                {categories
                  .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                  .map(cat => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="icon"
              label="Biểu tượng"
              className="form-item-half"
            >
              <Input prefix={<InfoCircleOutlined />} />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả"
            className="form-item-full"
          >
            <TextArea rows={4} />
          </Form.Item>

          {editingCategory && (
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
                  setEditingCategory(null);
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
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories; 