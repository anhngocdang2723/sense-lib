import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../api/api";
import "./DocumentDetail.css";

const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  const cleanUrl = imageUrl.startsWith('/api') ? imageUrl.substring(4) : imageUrl;
  return cleanUrl;
};

const getFullAudioUrl = (audioUrl) => {
  if (!audioUrl) return null;
  if (audioUrl.startsWith('http')) return audioUrl;
  // Nếu đã có /audio/ hoặc /uploads/audio/ thì giữ nguyên
  if (audioUrl.startsWith('/audio/') || audioUrl.startsWith('/uploads/audio/')) {
    return audioUrl;
  }
  // Nếu chỉ là tên file
  return `/audio/${audioUrl}`;
};

const DocumentDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryAudio, setSummaryAudio] = useState(null);

  // Fetch document detail, favorite count, favorited status, and increase view
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1. Lấy chi tiết document
        const res = await api.get(endpoints.documents.detailBySlug(slug));
        setDocument(res.data);
        // 2. Gọi tăng view và lấy lại view_count mới
        const viewRes = await api.post(endpoints.documents.view(res.data.id));
        setViewCount(viewRes.data.view_count || res.data.view_count || 0);
        // 3. Lấy số lượt yêu thích
        const favCountRes = await api.get(endpoints.favorites.count(res.data.id));
        setFavoriteCount(favCountRes.data.favorite_count || 0);
        // 4. Kiểm tra user đã yêu thích chưa
        try {
          const favStatusRes = await api.get(endpoints.favorites.isFavorited(res.data.id));
          setIsFavorited(!!favStatusRes.data.favorited);
        } catch {
          setIsFavorited(false);
        }
        // 5. Lấy audio file của tóm tắt nếu có
        if (res.data.audio_files && res.data.audio_files.length > 0) {
          // Tìm audio file không có chapter_id và section_id
          const summaryAudioFile = res.data.audio_files.find(audio => 
            !audio.chapter_id && !audio.section_id && audio.status === 'completed'
          );
          if (summaryAudioFile) {
            setSummaryAudio(summaryAudioFile);
          }
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err.response?.data?.detail || "Không tìm thấy tài liệu hoặc có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line
  }, [slug]);

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

  if (loading) return <div style={{ padding: 40 }}>Đang tải...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>{error}</div>;
  if (!document) return null;

  return (
    <div className="document-detail-bg">
      <div className="document-detail-container">
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
              {summaryAudio && (
                <div className="summary-audio-player">
                  <audio 
                    controls 
                    src={getFullAudioUrl(summaryAudio.file_url)}
                    style={{ width: '100%' }}
                  >
                    Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>
                </div>
              )}
              {/* DEBUG: Hiển thị tất cả audio files để kiểm tra */}
              {document.audio_files && document.audio_files.length > 0 && (
                <div style={{marginBottom: 16}}>
                  <b>Test audio list:</b>
                  {document.audio_files.map((audio, idx) => (
                    <div key={idx} style={{marginBottom: 8}}>
                      <audio controls src={getFullAudioUrl(audio.file_url)} style={{ width: '100%' }} />
                      <div style={{fontSize: 12, color: '#888'}}>{audio.file_url}</div>
                    </div>
                  ))}
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
  );
};

export default DocumentDetail; 