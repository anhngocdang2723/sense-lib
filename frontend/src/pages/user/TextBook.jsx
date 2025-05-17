import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { endpoints } from '../../api/api';
import './TextBook.css';
import placeholderImage from '../../assets/img/card/1.png';

// Hàm lấy URL ảnh chuẩn
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return placeholderImage;
  if (imageUrl.startsWith('http')) return imageUrl;
  const cleanUrl = imageUrl.startsWith('/api') ? imageUrl.substring(4) : imageUrl;
  return `${import.meta.env.VITE_API_URL}${cleanUrl}`;
};

function TextBook() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setImageError(false);
        const response = await api.get(`${endpoints.documents.detail}/${id}`);
        setBook(response.data);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Không thể tải thông tin sách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageUrl = () => {
    if (imageError || !book?.image_url) {
      return placeholderImage;
    }
    return getFullImageUrl(book.image_url);
  };

  if (loading) {
    return (
      <div className="textbook-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="textbook-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="textbook-container">
        <div className="empty-state">
          <p>Không tìm thấy thông tin sách.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="textbook-container">
      <div className="book-detail">
        <div className="book-header">
          <div className="book-cover highlight-shadow">
            <img 
              src={getImageUrl()}
              alt={book.title}
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          <div className="book-info">
            <h1 className="book-title highlight-title">{book.title}</h1>
            <div className="book-meta">
              <p><strong>Tác giả:</strong> {book.author?.name || 'Chưa cập nhật'}</p>
              <p><strong>Nhà xuất bản:</strong> {book.publisher?.name || 'Chưa cập nhật'}</p>
              <p><strong>Năm xuất bản:</strong> {book.publication_year || 'Chưa cập nhật'}</p>
              <p><strong>Thể loại:</strong> {book.categories?.map(cat => cat.name).join(', ') || 'Chưa cập nhật'}</p>
              <p><strong>Ngôn ngữ:</strong> {book.language?.name || 'Chưa cập nhật'}</p>
            </div>
            <div className="book-stats">
              <div className="stat-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8.99609C11.2044 8.99609 10.4413 9.31216 9.87868 9.87477C9.31607 10.4374 9 11.2004 9 11.9961C9 12.7917 9.31607 13.5548 9.87868 14.1174C10.4413 14.68 11.2044 14.9961 12 14.9961C12.7956 14.9961 13.5587 14.68 14.1213 14.1174C14.6839 13.5548 15 12.7917 15 11.9961C15 11.2004 14.6839 10.4374 14.1213 9.87477C13.5587 9.31216 12.7956 8.99609 12 8.99609ZM12 16.9961C10.6739 16.9961 9.40215 16.4693 8.46447 15.5316C7.52678 14.5939 7 13.3222 7 11.9961C7 10.67 7.52678 9.39824 8.46447 8.46056C9.40215 7.52288 10.6739 6.99609 12 6.99609C13.3261 6.99609 14.5979 7.52288 15.5355 8.46056C16.4732 9.39824 17 10.67 17 11.9961C17 13.3222 16.4732 14.5939 15.5355 15.5316C14.5979 16.4693 13.3261 16.9961 12 16.9961ZM12 4.49609C7 4.49609 2.73 7.60609 1 11.9961C2.73 16.3861 7 19.4961 12 19.4961C17 19.4961 21.27 16.3861 23 11.9961C21.27 7.60609 17 4.49609 12 4.49609Z" fill="#717171"/>
                </svg>
                <span>{book.view_count || 0} lượt đọc</span>
              </div>
              <div className="stat-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.3182 3.83307C20.1714 2.55152 18.5979 1.8457 16.887 1.8457C15.6082 1.8457 14.4371 2.26226 13.4061 3.08372C12.8858 3.49836 12.4144 4.00565 11.9988 4.59776C11.5833 4.00583 11.1118 3.49836 10.5914 3.08372C9.56051 2.26226 8.38937 1.8457 7.11056 1.8457C5.39973 1.8457 3.82598 2.55152 2.67918 3.83307C1.54607 5.09965 0.921875 6.82998 0.921875 8.70555C0.921875 10.636 1.6201 12.403 3.11914 14.2668C4.46015 15.9339 6.38749 17.6263 8.6194 19.5859C9.38152 20.2552 10.2454 21.0138 11.1424 21.8218C11.3793 22.0357 11.6834 22.1534 11.9988 22.1534C12.314 22.1534 12.6183 22.0357 12.8549 21.8222C13.7519 21.0139 14.6162 20.255 15.3787 19.5854C17.6103 17.6261 19.5376 15.9339 20.8786 14.2666C22.3777 12.403 23.0757 10.636 23.0757 8.70537C23.0757 6.82998 22.4515 5.09965 21.3182 3.83307Z" fill="#FF5C5C"/>
                </svg>
                <span>{book.download_count || 0} lượt tải</span>
              </div>
            </div>
            <div className="book-actions">
              <button className="read-button">Đọc sách</button>
              <button className="download-button">Tải xuống</button>
            </div>
          </div>
        </div>
        <div className="book-content">
          <h2>Mô tả</h2>
          <p className="book-description">{book.description || 'Chưa có mô tả.'}</p>
          <h2>Thông tin chi tiết</h2>
          <div className="book-details">
            <p><strong>ISBN:</strong> {book.isbn || 'Chưa cập nhật'}</p>
            <p><strong>Số trang:</strong> {book.page_count || 'Chưa cập nhật'}</p>
            <p><strong>Kích thước:</strong> {book.dimensions || 'Chưa cập nhật'}</p>
            <p><strong>Định dạng:</strong> {book.format || 'Chưa cập nhật'}</p>
            <p><strong>Ngày thêm:</strong> {new Date(book.created_at).toLocaleDateString('vi-VN')}</p>
            <p><strong>Cập nhật lần cuối:</strong> {new Date(book.updated_at).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextBook; 