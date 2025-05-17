import { useRef, useState, useEffect } from 'react';
import './Home.css';
import api, { endpoints } from '../../api/api';
import placeholderImage from '../../assets/img/card/1.png'; // Using card/1.png as placeholder

// Hàm lấy URL ảnh chuẩn
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return placeholderImage;
  if (imageUrl.startsWith('http')) return imageUrl;
  const cleanUrl = imageUrl.startsWith('/api') ? imageUrl.substring(4) : imageUrl;
  return `${import.meta.env.VITE_API_URL}${cleanUrl}`;
};

function Home() {
  const booksRef = useRef(null);
  const levelBooksRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (docId) => {
    setImageErrors(prev => ({ ...prev, [docId]: true }));
  };

  const getImageUrl = (doc) => {
    if (imageErrors[doc.id]) {
      return placeholderImage;
    }
    return getFullImageUrl(doc.image_url);
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoints.documents.list);
      if (response.data && Array.isArray(response.data.documents)) {
        setDocuments(response.data.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const bookCard = ref.current.querySelector('.book-card');
      if (bookCard) {
        const cardWidth = bookCard.offsetWidth + 16; // Includes gap (16px)
        const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
        ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const renderBookCard = (doc) => (
    <div className="book-card modern-card" key={doc.id} role="group" aria-roledescription="slide">
      <a 
        href={`/text-book/${doc.id}`} 
        title={doc.title}
        className="book-link"
      >
        <div className="image-container card-image-container">
          <img 
            src={getImageUrl(doc)}
            alt={doc.title}
            loading="lazy"
            onError={() => handleImageError(doc.id)}
            className="book-cover-img"
          />
        </div>
        <div className="book-info card-info">
          <div className="card-info-content">
            <h3 className="book-title card-title">{doc.title}</h3>
            <div className="card-meta">
              <span className="card-author">{doc.authors && doc.authors.length > 0 ? doc.authors.map(a => a.name).join(', ') : 'Tác giả: N/A'}</span>
              <span className="card-year">Năm xuất bản: {doc.publication_year || 'N/A'}</span>
            </div>
          </div>
          <div className="card-stats-block">
            <div className="stat-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8.99609C11.2044 8.99609 10.4413 9.31216 9.87868 9.87477C9.31607 10.4374 9 11.2004 9 11.9961C9 12.7917 9.31607 13.5548 9.87868 14.1174C10.4413 14.68 11.2044 14.9961 12 14.9961C12.7956 14.9961 13.5587 14.68 14.1213 14.1174C14.6839 13.5548 15 12.7917 15 11.9961C15 11.2004 14.6839 10.4374 14.1213 9.87477C13.5587 9.31216 12.7956 8.99609 12 8.99609ZM12 16.9961C10.6739 16.9961 9.40215 16.4693 8.46447 15.5316C7.52678 14.5939 7 13.3222 7 11.9961C7 10.67 7.52678 9.39824 8.46447 8.46056C9.40215 7.52288 10.6739 6.99609 12 6.99609C13.3261 6.99609 14.5979 7.52288 15.5355 8.46056C16.4732 9.39824 17 10.67 17 11.9961C17 13.3222 16.4732 14.5939 15.5355 15.5316C14.5979 16.4693 13.3261 16.9961 12 16.9961ZM12 4.49609C7 4.49609 2.73 7.60609 1 11.9961C2.73 16.3861 7 19.4961 12 19.4961C17 19.4961 21.27 16.3861 23 11.9961C21.27 7.60609 17 4.49609 12 4.49609Z" fill="#717171"></path>
              </svg>
              <span>{doc.view_count || 0} lượt đọc</span>
            </div>
            <div className="stat-item tablet-view">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.3182 3.83307C20.1714 2.55152 18.5979 1.8457 16.887 1.8457C15.6082 1.8457 14.4371 2.26226 13.4061 3.08372C12.8858 3.49836 12.4144 4.00565 11.9988 4.59776C11.5833 4.00583 11.1118 3.49836 10.5914 3.08372C9.56051 2.26226 8.38937 1.8457 7.11056 1.8457C5.39973 1.8457 3.82598 2.55152 2.67918 3.83307C1.54607 5.09965 0.921875 6.82998 0.921875 8.70555C0.921875 10.636 1.6201 12.403 3.11914 14.2668C4.46015 15.9339 6.38749 17.6263 8.6194 19.5859C9.38152 20.2552 10.2454 21.0138 11.1424 21.8218C11.3793 22.0357 11.6834 22.1534 11.9988 22.1534C12.314 22.1534 12.6183 22.0357 12.8549 21.8222C13.7519 21.0139 14.6162 20.255 15.3787 19.5854C17.6103 17.6261 19.5376 15.9339 20.8786 14.2666C22.3777 12.403 23.0757 10.636 23.0757 8.70537C23.0757 6.82998 22.4515 5.09965 21.3182 3.83307Z" fill="#FF5C5C"></path>
              </svg>
              <span>{doc.download_count || 0}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  );

  const renderLoadingState = () => (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Đang tải danh sách sách...</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="empty-state">
      <p>Chưa có sách nào trong danh sách.</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="error-state">
      <p>{error}</p>
      <button onClick={fetchDocuments} className="retry-button">
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="container">
      <div className="hero-container">
        <div className="hero-banner">
          <h1 className="hero-title">Thư viện số SenseLib</h1>
          <p className="hero-subtitle">
            Khám phá kho tàng học liệu số phong phú, đa dạng và chất lượng cao
          </p>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="books-section">
          <h2 className="section-title">Sách nổi bật</h2>
          <div className="carousel-container">
            <button 
              className="scroll-button left" 
              onClick={() => scroll(booksRef, 'left')}
              aria-label="Scroll left"
            >
              &lt;
            </button>
            <div className="books book-carousel" ref={booksRef}>
              {loading ? renderLoadingState() :
               error ? renderErrorState() :
               documents.length === 0 ? renderEmptyState() :
               documents.map(renderBookCard)}
            </div>
            <button 
              className="scroll-button right" 
              onClick={() => scroll(booksRef, 'right')}
              aria-label="Scroll right"
            >
              &gt;
            </button>
          </div>
          <button className="view-more">Xem thêm sách nổi bật</button>
        </div>

        <section className="level-books">
          <h2 className="section-title">Sách theo trình độ đọc</h2>
          <div className="level-options">
            {['Mức 1', 'Mức 2', 'Mức 3', 'Mức 4', 'Mức 5', 'Mức 6'].map(level => (
              <button 
                key={level} 
                className="level-button"
                onClick={() => console.log(`Selected level: ${level}`)}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="carousel-container">
            <button 
              className="scroll-button left" 
              onClick={() => scroll(levelBooksRef, 'left')}
              aria-label="Scroll left"
            >
              &lt;
            </button>
            <div className="level-books-list book-carousel" ref={levelBooksRef}>
              {loading ? renderLoadingState() :
               error ? renderErrorState() :
               documents.length === 0 ? renderEmptyState() :
               documents.slice(0, 4).map(renderBookCard)}
            </div>
            <button 
              className="scroll-button right" 
              onClick={() => scroll(levelBooksRef, 'right')}
              aria-label="Scroll right"
            >
              &gt;
            </button>
          </div>
          <button className="view-more">Xem thêm sách theo trình độ</button>
        </section>
      </div>
    </div>
  );
}

export default Home;