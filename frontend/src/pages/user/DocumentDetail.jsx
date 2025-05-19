import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/api";
import "./DocumentDetail.css";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DocumentDetail Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h2>Đã xảy ra lỗi</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  const cleanUrl = imageUrl.startsWith('/api') ? imageUrl.substring(4) : imageUrl;
  return cleanUrl;
};

const getFullAudioUrl = (audioUrl) => {
  try {
  if (!audioUrl) return null;
    
    // If it's already a full URL, return as is
  if (audioUrl.startsWith('http')) return audioUrl;
    
    // Get backend URL - hardcode for now, should be in env
    const BACKEND_URL = 'http://localhost:8000';
    
    // Clean the audio URL by removing any leading slashes and 'audio/' prefix
    const cleanUrl = audioUrl.replace(/^\/+/, '').replace(/^audio\//, '');
    
    // Encode the filename properly
    const encodedUrl = encodeURIComponent(cleanUrl);
    
    // Return full backend URL
    return `${BACKEND_URL}/uploads/audio/${encodedUrl}`;
  } catch (error) {
    console.error('Error in getFullAudioUrl:', error);
    return null;
  }
};

const DocumentDetail = () => {
  console.log('DocumentDetail rendering...');
  
  const { slug } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryAudio, setSummaryAudio] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  // Debug log for initial render
  useEffect(() => {
    console.log('Initial render with slug:', slug);
  }, []);

  // Fetch document detail, favorite count, favorited status, and increase view
  useEffect(() => {
    const fetchAll = async () => {
      console.log('Starting fetchAll...');
      setLoading(true);
      try {
        // 1. Lấy chi tiết document
        console.log('Fetching document details...');
        const res = await api.get(endpoints.documents.detailBySlug(slug));
        console.log('Document details received:', res.data);
        setDocument(res.data);
        setDownloadCount(res.data.download_count || 0);

        // 2. Gọi tăng view và lấy lại view_count mới
        console.log('Updating view count...');
        const viewRes = await api.post(endpoints.documents.view(res.data.id));
        setViewCount(viewRes.data.view_count || res.data.view_count || 0);

        // 3. Lấy số lượt yêu thích
        console.log('Fetching favorite count...');
        const favCountRes = await api.get(endpoints.favorites.count(res.data.id));
        setFavoriteCount(favCountRes.data.favorite_count || 0);

        // 4. Kiểm tra user đã yêu thích chưa
        try {
          console.log('Checking favorite status...');
          const favStatusRes = await api.get(endpoints.favorites.isFavorited(res.data.id));
          setIsFavorited(!!favStatusRes.data.favorited);
        } catch (err) {
          console.log('Error checking favorite status:', err);
          setIsFavorited(false);
        }

        // 5. Lấy audio file của tóm tắt nếu có
        if (res.data.audio_files && res.data.audio_files.length > 0) {
          console.log('Processing audio files:', res.data.audio_files);
          const summaryAudioFile = res.data.audio_files.find(audio => 
            !audio.chapter_id && !audio.section_id && audio.status === 'completed'
          );
          if (summaryAudioFile) {
            console.log('Found summary audio:', summaryAudioFile);
            setSummaryAudio(summaryAudioFile);
          }
        }
      } catch (err) {
        console.error('Error in fetchAll:', err);
        setError(err.response?.data?.detail || "Không tìm thấy tài liệu hoặc có lỗi xảy ra.");
      } finally {
        setLoading(false);
        console.log('fetchAll completed');
      }
    };
    
    if (slug) {
      console.log('Calling fetchAll with slug:', slug);
    fetchAll();
    }
  }, [slug]);

  // Fetch ratings only
  useEffect(() => {
    const fetchRatings = async () => {
      if (!document) return;
      try {
        const [ratingsRes, avgRes] = await Promise.all([
          api.get(endpoints.ratings.byDocument(document.id)),
          api.get(endpoints.ratings.average(document.id))
        ]);
        
        setRatings(ratingsRes.data);
        setAverageRating(avgRes.data.average);
        setRatingCount(avgRes.data.count);
        
        // Find user's rating if exists
        const userRating = ratingsRes.data.find(r => r.user_id === localStorage.getItem('user_id'));
        if (userRating) {
          setUserRating(userRating.rating);
          setRatingComment(userRating.comment || "");
        }
      } catch (err) {
        console.error('Error fetching ratings:', err);
      }
    };
    fetchRatings();
  }, [document]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (favoriteLoading || !document) return;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await api.delete(endpoints.favorites.remove(document.id));
        setIsFavorited(false);
        setFavoriteCount((c) => Math.max(0, c - 1));
      } else {
        await api.post(endpoints.favorites.add, { document_id: document.id });
        setIsFavorited(true);
        setFavoriteCount((c) => c + 1);
      }
    } catch (err) {
      // Có thể show toast lỗi
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle rating and comment submission together
  const handleRatingSubmit = async () => {
    if (!userRating) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Lưu trữ giá trị hiện tại
      const currentRating = userRating;
      const currentComment = ratingComment;

      // Reset form ngay lập tức để tránh submit nhiều lần
      setRatingComment("");
      setUserRating(0);

      const response = await api.post(endpoints.ratings.create + '/', {
        document_id: document.id,
        rating: currentRating,
        comment: currentComment
      });

      if (response.status === 200) {
        try {
          // Refresh ratings
          const [ratingsRes, avgRes] = await Promise.all([
            api.get(endpoints.ratings.byDocument(document.id)),
            api.get(endpoints.ratings.average(document.id))
          ]);
          
          setRatings(ratingsRes.data);
          setAverageRating(avgRes.data.average || 0);
          setRatingCount(avgRes.data.count || 0);

          // Show success message
          alert("Cảm ơn bạn đã đánh giá!");
        } catch (refreshErr) {
          console.error('Error refreshing ratings:', refreshErr);
          // Vẫn thông báo thành công vì đánh giá đã được lưu
          alert("Đã gửi đánh giá thành công!");
        }
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!");
      // Khôi phục lại form nếu có lỗi
      setRatingComment(ratingComment);
      setUserRating(userRating);
    }
  };

  if (loading) {
    console.log('Rendering loading state...');
    return <div style={{ padding: 40 }}>Đang tải...</div>;
  }
  
  if (error) {
    console.log('Rendering error state:', error);
    return <div style={{ padding: 40, color: 'red' }}>{error}</div>;
  }
  
  if (!document) {
    console.log('No document data, rendering null');
    return null;
  }

  console.log('Rendering full document view');
  return (
    <ErrorBoundary>
    <div className="document-detail-bg">
      <div className="document-detail-container">
          <div className="document-detail-main">
            <div className="document-detail-header-section">
        {document.image_url && (
          <img
            src={getFullImageUrl(document.image_url)}
            alt={document.title}
            className="document-detail-cover"
          />
        )}
        <div className="document-detail-info">
          <div className="document-detail-header">
            <h1 className="document-detail-title">{document.title}</h1>
            <span
              className={`favorite-icon${isFavorited ? " favorited" : ""}`}
              onClick={handleToggleFavorite}
              style={{ cursor: 'pointer', marginLeft: 12, fontSize: 28 }}
              title={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
            >
              {isFavorited ? "❤️" : "🤍"}
            </span>
          </div>
          <div className="document-detail-stats">
            <span className="favorite">
              <span style={{ color: '#ff5a5f', fontSize: 20, marginRight: 4 }}>❤️</span>
              {favoriteCount} người yêu thích
            </span>
            <span className="view">
              <span style={{ color: '#555', fontSize: 20, marginLeft: 18, marginRight: 4 }}>👁️</span>
              {viewCount} lượt đọc
            </span>
            <span className="download">
              <span style={{ color: '#2196F3', fontSize: 20, marginLeft: 18, marginRight: 4 }}>📥</span>
              {downloadCount} lượt tải
            </span>
          </div>
          <div className="document-detail-meta-list">
            {document.category && (
              <div className="document-detail-meta-item">
                <span className="meta-label">Bộ sách:</span>
                <span className="meta-value">{document.category.name}</span>
              </div>
            )}
            {document.publisher && (
              <div className="document-detail-meta-item">
                <span className="meta-label">Nhà xuất bản:</span>
                <span className="meta-value">{document.publisher.name}</span>
              </div>
            )}
            {document.publication_year && (
              <div className="document-detail-meta-item">
                <span className="meta-label">Xuất bản:</span>
                <span className="meta-value">{document.publication_year}</span>
              </div>
            )}
            {document.authors && document.authors.length > 0 && (
              <div className="document-detail-meta-item">
                <span className="meta-label">Tác giả:</span>
                <span className="meta-value">{document.authors.map(a => a.name).join(", ")}</span>
              </div>
            )}
            {document.tags && document.tags.length > 0 && (
              <div className="document-detail-meta-item">
                <span className="meta-label">Thể loại:</span>
                <span className="meta-value">{document.tags.map(t => t.name).join(", ")}</span>
              </div>
            )}
          </div>
          <div className="document-detail-desc">
            <b>Mô tả</b>
            <p>{document.description}</p>
          </div>
          <div className="document-detail-actions">
            <button 
              className="document-detail-read-btn"
              onClick={() => navigate(`/read/${document.slug}`)}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Đọc sách
            </button>
            <button 
              className="document-detail-summary-btn"
              onClick={() => setShowSummary(true)}
              style={{
                backgroundColor: '#f8f9fa',
                color: '#212529',
                border: '1px solid #dee2e6',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                marginLeft: '12px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e9ecef'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            >
              Xem tóm tắt
            </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="document-feedback-section">
            <div className="document-rating-section">
              <h3>Đánh giá và nhận xét ({ratingCount})</h3>
              <div className="rating-stats">
                <div className="average-rating">
                  <span className="rating-number">{averageRating.toFixed(1)}</span>
                  <div className="star-display">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star}
                        className={`star ${star <= averageRating ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* User Rating Input */}
              <div className="user-rating-input">
                <h4>Đánh giá của bạn</h4>
                <div className="star-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star}
                      className={`star ${star <= userRating ? 'filled' : ''}`}
                      onClick={() => setUserRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Nhận xét của bạn về tài liệu này..."
                  rows={3}
                />
                <button 
                  onClick={handleRatingSubmit}
                  disabled={!userRating}
                  className="submit-rating-btn"
                >
                  Gửi đánh giá
                </button>
              </div>

              {/* Ratings List */}
              <div className="ratings-list">
                {ratings && ratings.length > 0 ? (
                  ratings.map(rating => {
                    if (!rating || !rating.id) return null;
                    return (
                      <div key={rating.id} className="rating-item">
                        <div className="rating-header">
                          <div className="rating-user-info">
                            <span className="rating-author">
                              {rating.user?.username || 'Người dùng ẩn danh'}
                            </span>
                            <div className="star-display">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                  key={star}
                                  className={`star ${star <= rating.rating ? 'filled' : ''}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="rating-date">
                            {rating.created_at ? new Date(rating.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        {rating.comment && (
                          <div className="rating-content">{rating.comment}</div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="no-ratings">Chưa có đánh giá nào</div>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div className="summary-modal-overlay" onClick={() => setShowSummary(false)}>
          <div className="summary-modal-content" onClick={e => e.stopPropagation()}>
            <div className="summary-modal-header">
              <h2>Tóm tắt: {document.title}</h2>
              <button 
                className="summary-modal-close"
                onClick={() => setShowSummary(false)}
              >
                ×
              </button>
            </div>
            <div className="summary-modal-body">
                {/* Summary Audio Player with Error Handling */}
              {summaryAudio && (
                <div className="summary-audio-player">
                  <audio 
                    controls 
                    src={getFullAudioUrl(summaryAudio.file_url)}
                    style={{ width: '100%' }}
                      onError={(e) => {
                        console.error('Audio playback error:', e);
                        alert('Không thể phát audio. Vui lòng thử lại sau.');
                      }}
                  >
                    Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>
                </div>
              )}

                {/* Debug Audio List with Error Handling */}
              {document.audio_files && document.audio_files.length > 0 && (
                <div style={{marginBottom: 16}}>
                  <b>Test audio list:</b>
                    {document.audio_files.map((audio, idx) => {
                      const audioUrl = getFullAudioUrl(audio.file_url);
                      console.log(`Audio ${idx} details:`, {
                        original: audio.file_url,
                        processed: audioUrl,
                        file: audio
                      });
                      return (
                    <div key={idx} style={{marginBottom: 8}}>
                          <audio 
                            controls 
                            preload="metadata"
                            style={{ width: '100%' }}
                            onError={(e) => {
                              console.error(`Audio ${idx} playback error details:`, {
                                error: e,
                                audioUrl,
                                audioFile: audio,
                                target: e.target,
                                nativeEvent: e.nativeEvent
                              });
                              
                              // Try direct XHR request to check response headers
                              const xhr = new XMLHttpRequest();
                              xhr.open('GET', audioUrl);
                              xhr.responseType = 'blob';  // Request as blob
                              xhr.onload = function() {
                                console.log(`Audio ${idx} XHR response:`, {
                                  status: xhr.status,
                                  statusText: xhr.statusText,
                                  contentType: xhr.getResponseHeader('Content-Type'),
                                  contentLength: xhr.getResponseHeader('Content-Length'),
                                  response: xhr.response instanceof Blob ? 'Blob data' : 'Invalid response'
                                });
                              };
                              xhr.onerror = function(err) {
                                console.error(`Audio ${idx} XHR error:`, err);
                              };
                              xhr.send();
                            }}
                          >
                            <source src={audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                          <div style={{fontSize: 12, color: '#888'}}>
                            Original: {audio.file_url}<br/>
                            Full URL: {audioUrl}<br/>
                            <button onClick={() => {
                              // Try fetch with explicit headers and credentials
                              fetch(audioUrl, {
                                headers: {
                                  'Accept': 'audio/mpeg,audio/*;q=0.8,*/*;q=0.5'
                                },
                                credentials: 'include'  // Include cookies if needed
                              })
                              .then(response => {
                                console.log('Fetch response headers:', {
                                  type: response.type,
                                  status: response.status,
                                  contentType: response.headers.get('content-type')
                                });
                                return response.blob();
                              })
                              .then(blob => {
                                console.log('Received blob:', {
                                  size: blob.size,
                                  type: blob.type
                                });
                                const url = URL.createObjectURL(blob);
                                const audio = new Audio(url);
                                audio.onerror = (e) => console.error('Blob audio error:', e);
                                audio.oncanplay = () => {
                                  console.log('Blob audio can play!');
                                  URL.revokeObjectURL(url);
                                };
                                audio.load();
                                audio.play().catch(e => console.error('Blob audio play error:', e));
                              })
                              .catch(e => console.error('Fetch blob error:', e));
                            }}>
                              Test Load
                            </button>
                          </div>
                    </div>
                      );
                    })}
                </div>
              )}

              <div className="summary-text">
                {document.ai_summary ? (
                  <p>{document.ai_summary}</p>
                ) : (
                  <p>Chưa có tóm tắt cho tài liệu này.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
};

export default DocumentDetail; 