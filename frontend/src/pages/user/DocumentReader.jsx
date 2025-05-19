import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { endpoints } from "../../api/api";
import PDFViewer from "../../components/PDFViewer";
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';

const getFullPdfUrl = (fileName) => {
  if (!fileName) return null;
  
  // Nếu là URL đầy đủ
  if (fileName.startsWith('http')) return fileName;
  
  // Nếu đã có /uploads/ thì thêm domain
  if (fileName.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_API_URL}${fileName}`;
  }
  
  // Nếu chỉ là tên file
  return `${import.meta.env.VITE_API_URL}/uploads/${fileName}`;
};

export default function DocumentReader() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [readingProgress, setReadingProgress] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const res = await api.get(endpoints.documents.detailBySlug(slug));
        setDocument(res.data);
        setDownloadCount(res.data.download_count || 0);
        
        if (!res.data.file_name) {
          throw new Error("Không tìm thấy file PDF");
        }
        
        const fullPdfUrl = getFullPdfUrl(res.data.file_name);
        console.log("Document data:", res.data); // Debug log
        console.log("Generated PDF URL:", fullPdfUrl); // Debug log
        
        // Test if URL is accessible
        try {
          const response = await fetch(fullPdfUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`PDF file not accessible: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          console.error("Error checking PDF URL:", err);
          throw new Error("Không thể truy cập file PDF. Vui lòng kiểm tra lại đường dẫn.");
        }
        
        setPdfUrl(fullPdfUrl);
      } catch (err) {
        console.error("Error loading document:", err);
        setError(err.message || "Không tìm thấy tài liệu hoặc có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [slug]);

  // Add function to handle reading progress updates
  const handleReadingProgress = async (progressData) => {
    try {
      console.log("Sending Progress Data:", JSON.stringify(progressData, null, 2));
      const response = await api.post(endpoints.readingProgress.create, progressData);
      console.log("Reading Progress Response:", response.data);
      setReadingProgress(response.data);
    } catch (error) {
      console.error("Error updating reading progress:", error);
    }
  };

  // Handle download count update
  const handleDownloadCountUpdate = (newCount) => {
    setDownloadCount(newCount);
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#f5f5f5", padding: 0 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0002", padding: 0, marginTop: 32, marginBottom: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: 24, borderBottom: '1px solid #eee', borderTopLeftRadius: 12, borderTopRightRadius: 12, background: 'linear-gradient(90deg, #4285f4 0%, #6ab7ff 100%)', color: '#fff' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, marginRight: 18, cursor: 'pointer' }} title="Quay lại">
            <ArrowLeftOutlined />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: 0.5 }}>{document?.title || 'Đang tải...'}</h1>
            {document?.authors && document.authors.length > 0 && (
              <div style={{ fontSize: 16, marginTop: 4, color: '#e3e3e3' }}>
                Tác giả: {document.authors.map(a => a.name).join(", ")}
              </div>
            )}
          </div>
          {pdfUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#fff', fontSize: 14 }}>
                {downloadCount} lượt tải
              </span>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download style={{ color: '#fff', fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: 6, fontWeight: 500 }}>
                <DownloadOutlined /> Tải PDF
              </a>
            </div>
          )}
        </div>
        {/* Mô tả */}
        {document?.description && (
          <div style={{ padding: '18px 24px 0 24px', color: '#444', fontSize: 16, lineHeight: 1.6 }}>
            <b>Mô tả:</b>
            <div style={{ marginTop: 4 }}>{document.description}</div>
          </div>
        )}
        {/* Reading Progress Display */}
        {readingProgress && (
          <div style={{ padding: '12px 24px', background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: 14, color: '#666' }}>
              <strong>Tiến độ đọc:</strong> {readingProgress.progress_value}%
              <br />
              <small>Lần đọc cuối: {new Date(readingProgress.last_read_at).toLocaleString()}</small>
            </div>
          </div>
        )}
        {/* PDF Viewer */}
        <div style={{ padding: 24, paddingTop: 12 }}>
          {error && <div style={{ color: "red", padding: "20px", textAlign: "center", fontSize: 18 }}>{error}</div>}
          {loading && (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div className="loader" style={{ margin: '0 auto 16px', width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #4285f4', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ fontSize: 18, color: '#888' }}>Đang tải file PDF...</div>
            </div>
          )}
          {pdfUrl && !loading && !error && (
            <PDFViewer 
              pdfUrl={pdfUrl} 
              documentId={document?.id} 
              onProgressUpdate={handleReadingProgress}
              onDownloadCountUpdate={handleDownloadCountUpdate}
            />
          )}
        </div>
      </div>
      {/* Loader animation keyframes */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .pdf-viewer, .container { max-width: 100vw !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
} 