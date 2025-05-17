import { useState, useEffect } from 'react';
import { sessionService } from '../services/sessionService';
import './SessionManager.css';

function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentSession = sessionService.getSession();

  const loadSessions = async () => {
    try {
      setLoading(true);
      const activeSessions = await sessionService.getActiveSessions();
      setSessions(activeSessions);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách phiên đăng nhập');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await sessionService.deleteSession(sessionId);
      await loadSessions();
    } catch (err) {
      setError('Không thể xóa phiên đăng nhập');
      console.error(err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  if (loading) {
    return <div className="session-manager loading">Đang tải...</div>;
  }

  return (
    <div className="session-manager">
      <h2>Phiên đăng nhập đang hoạt động</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="sessions-list">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className={`session-item ${session.id === currentSession?.id ? 'current' : ''}`}
          >
            <div className="session-info">
              <div className="session-device">
                <strong>Thiết bị:</strong> {session.user_agent}
              </div>
              <div className="session-ip">
                <strong>IP:</strong> {session.ip_address || 'Không xác định'}
              </div>
              <div className="session-time">
                <strong>Đăng nhập lúc:</strong> {new Date(session.created_at).toLocaleString()}
              </div>
              <div className="session-expiry">
                <strong>Hết hạn:</strong> {new Date(session.expires_at).toLocaleString()}
              </div>
            </div>
            
            {session.id !== currentSession?.id && (
              <button
                className="delete-btn"
                onClick={() => handleDeleteSession(session.id)}
              >
                Đăng xuất
              </button>
            )}
            
            {session.id === currentSession?.id && (
              <span className="current-badge">Phiên hiện tại</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SessionManager; 