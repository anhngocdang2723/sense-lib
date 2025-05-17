import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, endpoints } from '../api/api';
import { sessionService } from '../services/sessionService';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Login to get access token
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await fetch(getApiUrl(endpoints.auth.login), {
        method: 'POST',
        body: formData,
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.detail || 'Đăng nhập thất bại');
      }

      const loginData = await loginResponse.json();
      const accessToken = loginData.access_token;

      // Step 2: Create session
      const sessionData = {
        token: accessToken,
        user_agent: navigator.userAgent
      };

      const sessionResponse = await fetch(getApiUrl(endpoints.sessions.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(sessionData)
      });

      if (!sessionResponse.ok) {
        throw new Error('Không thể tạo phiên đăng nhập');
      }

      const session = await sessionResponse.json();

      // Step 3: Store all necessary data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      sessionService.setSession(session);
      
      // Step 4: Navigate to home
      navigate('/');
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng nhập</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div className="login-footer">
          <a href="/forgot-password">Quên mật khẩu?</a>
          <span> | </span>
          <a href="/register">Đăng ký tài khoản</a>
        </div>
      </div>
    </div>
  );
}

export default Login; 