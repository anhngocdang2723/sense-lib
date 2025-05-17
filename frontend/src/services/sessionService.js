import { getApiUrl, endpoints } from '../api/api';

class SessionService {
  getSession() {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session) : null;
  }

  setSession(session) {
    localStorage.setItem('session', JSON.stringify(session));
  }

  clearSession() {
    localStorage.removeItem('session');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isSessionValid() {
    const session = this.getSession();
    if (!session) return false;
    
    const expiresAt = new Date(session.expires_at);
    return expiresAt > new Date();
  }

  async refreshSession() {
    try {
      const session = this.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(getApiUrl(endpoints.sessions.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          token: session.token,
          user_agent: navigator.userAgent
        })
      });

      if (!response.ok) throw new Error('Failed to refresh session');

      const newSession = await response.json();
      this.setSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Error refreshing session:', error);
      this.clearSession();
      throw error;
    }
  }

  async getActiveSessions() {
    try {
      const session = this.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(getApiUrl(endpoints.sessions.list), {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to get sessions');

      const data = await response.json();
      return data.sessions;
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }

  async deleteSession(sessionId) {
    try {
      const session = this.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(getApiUrl(endpoints.sessions.delete(sessionId)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete session');

      // If deleting current session, clear all session data
      if (sessionId === session.id) {
        this.clearSession();
      }

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  async logAccess(documentId, action) {
    try {
      const session = this.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(getApiUrl(endpoints.sessions.accessLogs.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          document_id: documentId,
          action: action,
          session_id: session.id,
          user_agent: navigator.userAgent
        })
      });

      if (!response.ok) throw new Error('Failed to log access');

      return await response.json();
    } catch (error) {
      console.error('Error logging access:', error);
      throw error;
    }
  }
}

export const sessionService = new SessionService(); 