import React, { useState, useEffect } from 'react';
import { Card, Empty, Spin, List, Button, message } from 'antd';
import { HeartFilled, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/favorites/user/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      message.error('Không thể tải danh sách tài liệu yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (documentId) => {
    try {
      await api.delete(`/api/favorites/${documentId}`);
      message.success('Đã xóa khỏi danh sách yêu thích');
      fetchFavorites(); // Refresh list
    } catch (error) {
      console.error('Error removing favorite:', error);
      message.error('Không thể xóa khỏi danh sách yêu thích');
    }
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <Card className="favorites-card">
        <h2 className="favorites-title">
          <HeartFilled className="heart-icon" /> Tài liệu yêu thích
        </h2>

        {favorites.length === 0 ? (
          <Empty
            description="Bạn chưa có tài liệu yêu thích nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            className="favorites-list"
            itemLayout="horizontal"
            dataSource={favorites}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeFavorite(item.document.id)}
                    danger
                  >
                    Xóa
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <img
                      src={item.document.cover_image || '/default-cover.png'}
                      alt={item.document.title}
                      className="document-cover"
                    />
                  }
                  title={
                    <Link to={`/document/${item.document.slug}`}>
                      {item.document.title}
                    </Link>
                  }
                  description={
                    <div className="document-meta">
                      {item.document.author && (
                        <span className="author">{item.document.author.name}</span>
                      )}
                      <span className="views">
                        <EyeOutlined /> {item.document.views || 0}
                      </span>
                      {item.document.category && (
                        <span className="category">{item.document.category.name}</span>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Favorites; 