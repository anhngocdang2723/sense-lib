import React, { useState } from 'react';
import { Card, Avatar, Form, Input, Button, message, Upload, Tabs } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, UploadOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/api';
import './Profile.css';

const { TabPane } = Tabs;

const Profile = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordForm] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await api.put('/api/users/profile', values);
      message.success('Thông tin cá nhân đã được cập nhật');
    } catch (error) {
      message.error('Không thể cập nhật thông tin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordChange = async (values) => {
    try {
      setLoading(true);
      await api.post('/api/users/change-password', {
        old_password: values.oldPassword,
        new_password: values.newPassword,
      });
      message.success('Mật khẩu đã được thay đổi');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Không thể thay đổi mật khẩu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'avatar',
    action: '/api/users/upload-avatar',
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('token'),
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success('Avatar đã được cập nhật');
      } else if (info.file.status === 'error') {
        message.error('Không thể tải lên avatar');
      }
    },
  };

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <div className="profile-header">
          <Avatar 
            size={100} 
            src={user?.avatar_url}
            icon={<UserOutlined />}
          />
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Thay đổi avatar</Button>
          </Upload>
        </div>

        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin cá nhân" key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                username: user?.username,
                email: user?.email,
                full_name: user?.full_name,
                phone_number: user?.phone_number,
                address: user?.address,
              }}
            >
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>

              <Form.Item
                name="full_name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="phone_number"
                label="Số điện thoại"
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item
                name="address"
                label="Địa chỉ"
              >
                <Input prefix={<HomeOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật thông tin
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Đổi mật khẩu" key="2">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onPasswordChange}
            >
              <Form.Item
                name="oldPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile; 