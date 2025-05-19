import React, { useState } from 'react';
import { Form, Input, Upload, Button, message, Select, Card, Space, Typography, InputNumber } from 'antd';
import { UploadOutlined, FileTextOutlined, UserOutlined, ShopOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api, { endpoints } from '../../api/api';
import './UploadDocument.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const UploadDocument = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [tags, setTags] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const navigate = useNavigate();

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await api.get(endpoints.categories.list);
        const categoriesData = categoriesRes.data.categories || categoriesRes.data || [];
        setCategories(categoriesData);

        // Fetch authors
        const authorsRes = await api.get(endpoints.authors.list);
        setAuthors(authorsRes.data || []);

        // Fetch tags
        const tagsRes = await api.get(endpoints.tags.list);
        setTags(tagsRes.data || []);

        // Fetch publishers
        const publishersRes = await api.get(endpoints.publishers.list);
        setPublishers(publishersRes.data || []);

        // Fetch languages
        const languagesRes = await api.get(endpoints.languages.list);
        setLanguages(languagesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
    };
    fetchData();
  }, []);

  const handleUpload = async (values) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('category_id', values.category_id);
      formData.append('file', values.file[0].originFileObj);
      
      if (values.image) {
        formData.append('image', values.image[0].originFileObj);
      }

      // Add new fields
      if (values.author_ids) {
        formData.append('authors', JSON.stringify(values.author_ids));
      }
      if (values.tag_ids) {
        formData.append('tags', JSON.stringify(values.tag_ids));
      }
      if (values.publisher_id) {
        formData.append('publisher_id', values.publisher_id);
      }
      if (values.language) {
        formData.append('language', values.language);
      }
      if (values.publication_year) {
        formData.append('publication_year', values.publication_year);
      }
      if (values.isbn) {
        formData.append('isbn', values.isbn);
      }
      if (values.proposed_score) {
        formData.append('proposed_score', values.proposed_score);
      }

      const response = await api.post(endpoints.documents.userUpload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        message.success('Tài liệu đã được tải lên thành công và đang chờ duyệt!');
        form.resetFields();
        navigate('/user/documents');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.message ||
        'Tải lên tài liệu thất bại!';
      message.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div className="upload-document-container">
      <Card className="upload-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="upload-header">
            <Title level={2}>Tải lên tài liệu mới</Title>
            <Text type="secondary">
              Tài liệu của bạn sẽ được xem xét trong vòng 24 giờ. Nếu được chấp nhận, bạn sẽ nhận được điểm tương ứng với đề xuất của bạn.
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpload}
            className="upload-form"
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề tài liệu' }]}
            >
              <Input placeholder="Nhập tiêu đề tài liệu" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea
                placeholder="Nhập mô tả tài liệu (không bắt buộc)"
                rows={4}
              />
            </Form.Item>

            <Form.Item
              name="category_id"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select 
                placeholder="Chọn danh mục"
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
              label="Tác giả"
              rules={[{ required: true, message: 'Vui lòng chọn tác giả' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn tác giả"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {authors.map(author => (
                  <Option key={author.id} value={author.id}>
                    <Space>
                      <UserOutlined />
                      {author.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="tag_ids"
              label="Thể loại"
            >
              <Select
                mode="multiple"
                placeholder="Chọn thể loại"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {tags.map(tag => (
                  <Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="publisher_id"
              label="Nhà xuất bản"
            >
              <Select
                placeholder="Chọn nhà xuất bản"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {publishers.map(pub => (
                  <Option key={pub.id} value={pub.id}>
                    <Space>
                      <ShopOutlined />
                      {pub.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="language"
              label="Ngôn ngữ"
              rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
            >
              <Select
                placeholder="Chọn ngôn ngữ"
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
              name="publication_year"
              label="Năm xuất bản"
            >
              <InputNumber
                min={1800}
                max={new Date().getFullYear()}
                placeholder="Nhập năm xuất bản"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="isbn"
              label="ISBN"
            >
              <Input placeholder="Nhập mã ISBN" />
            </Form.Item>

            <Form.Item
              name="proposed_score"
              label="Ứng cử điểm số"
              rules={[
                { required: true, message: 'Vui lòng nhập điểm ứng cử' },
                { type: 'number', min: 1, max: 5, message: 'Điểm phải từ 1 đến 5' }
              ]}
            >
              <InputNumber
                min={1}
                max={5}
                placeholder="Nhập điểm ứng cử (1-5)"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="file"
              label="Tài liệu"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: 'Vui lòng chọn tài liệu' }]}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept=".pdf,.doc,.docx,.txt"
              >
                <Button icon={<UploadOutlined />}>Chọn tài liệu</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="image"
              label="Ảnh bìa (không bắt buộc)"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept="image/*"
                listType="picture"
              >
                <Button icon={<FileTextOutlined />}>Chọn ảnh bìa</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                block
              >
                {uploading ? 'Đang tải lên...' : 'Tải lên tài liệu'}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default UploadDocument; 