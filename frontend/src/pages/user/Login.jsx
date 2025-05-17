import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, endpoints } from '../../api/api';
import { sessionService } from '../../services/sessionService';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleForgotClick = (e) => {
    e.preventDefault();
    setIsForgot(true);
    setIsRegister(false);
    setError('');
    setSuccessMsg('');
    setOtp('');
    setPassword('');
    setIsOtpSent(false);
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setIsRegister(true);
    setIsForgot(false);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setUsername('');
    setFullName('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email) {
      setError('Vui lòng nhập email!');
      return;
    }
    setIsLoading(true);
    try {
      const url = `${getApiUrl(endpoints.user.forgotPassword)}?email=${encodeURIComponent(email)}`;
      const response = await fetch(url, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Không gửi được email xác nhận');
      }
      setIsOtpSent(true);
      setSuccessMsg('Đã gửi mã xác nhận OTP đến email của bạn.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email || !otp || !password) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl(endpoints.user.resetPassword), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otp,
          new_password: password,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Đổi mật khẩu thất bại');
      }
      setSuccessMsg('Đổi mật khẩu thành công!');
      setTimeout(() => {
        setIsForgot(false);
        setIsOtpSent(false);
        setEmail('');
        setPassword('');
        setOtp('');
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email || !password || !username || !fullName) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        email,
        password,
        username,
        full_name: fullName,
      });
      const url = `${getApiUrl(endpoints.auth.register)}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Đăng ký tài khoản thất bại');
      }
      setSuccessMsg('Đăng ký tài khoản thành công!');
      setTimeout(() => {
        setIsRegister(false);
        setEmail('');
        setPassword('');
        setUsername('');
        setFullName('');
        setError('');
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
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
      localStorage.setItem('userRole', loginData.user.role); // Store user role
      sessionService.setSession(session);
      
      // Step 4: Navigate based on user role
      if (loginData.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div style={{ textAlign: 'center' }}>
          <a href="/" className="sign__logo" style={{ margin: '10px' }}>
            <img src="/src/assets/original (2).png" alt="Logo" />
          </a>
          <h2 className="welcome-text">Chào mừng đến với SenseLib</h2>
          <p className="welcome-subtext">Hệ thống quản lý tài liệu thông minh</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}
        {isRegister ? (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="input-field"
                placeholder="Nhập họ và tên"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field"
                placeholder="Nhập tên đăng nhập"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="Nhập email"
                disabled={isLoading}
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
                className="input-field"
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
            <div className="login-footer">
              <a href="#" onClick={() => setIsRegister(false)}>Quay lại đăng nhập</a>
            </div>
          </form>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field pr-16"
                  placeholder="Nhập email của bạn"
                  disabled={isLoading || (isForgot && isOtpSent)}
                />
                {isForgot && !isOtpSent && (
                  <button
                    type="button"
                    className="send-otp-btn"
                    disabled={isLoading}
                    onClick={handleSendOtp}
                  >
                    Gửi
                  </button>
                )}
              </div>
            </div>
            {isForgot && (
              <div className="form-group">
                <label htmlFor="otp">Mã OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Nhập mã OTP"
                  disabled={!isOtpSent || isLoading}
                />
              </div>
            )}
            <form onSubmit={isForgot ? (isOtpSent ? handleForgotSubmit : handleSendOtp) : handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="password">{isForgot ? 'Mật khẩu mới' : 'Mật khẩu'}</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder={isForgot ? 'Nhập mật khẩu mới' : 'Nhập mật khẩu của bạn'}
                  disabled={isForgot ? (!isOtpSent || isLoading) : isLoading}
                />
              </div>
              <button
                type="submit"
                className="login-btn"
                disabled={isForgot ? (!isOtpSent || isLoading) : isLoading}
              >
                {isForgot ? 'Xác nhận' : (isLoading ? 'Đang đăng nhập...' : 'Đăng nhập')}
              </button>
            </form>
            <div className="login-footer">
              {!isForgot ? (
                <>
                  <a href="#" onClick={handleForgotClick}>Quên mật khẩu?</a>
                  <span>|</span>
                  <a href="#" onClick={handleRegisterClick}>Đăng ký tài khoản</a>
                </>
              ) : (
                <>
                  <a href="#" onClick={() => setIsForgot(false)}>Quay lại đăng nhập</a>
                </>
              )}
            </div>
            {!isForgot && (
              <div className="sign__social">
                <a className="fb" href="#">
                  <svg viewBox="0 0 9 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.56341 16.8197V8.65888H7.81615L8.11468 5.84663H5.56341L5.56724 4.43907C5.56724 3.70559 5.63693 3.31257 6.69042 3.31257H8.09873V0.5H5.84568C3.1394 0.5 2.18686 1.86425 2.18686 4.15848V5.84695H0.499939V8.6592H2.18686V16.8197H5.56341Z" />
                  </svg>
                </a>
                <a className="tw" href="#">
                  <svg viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.55075 3.19219L7.58223 3.71122L7.05762 3.64767C5.14804 3.40404 3.47978 2.57782 2.06334 1.1902L1.37085 0.501686L1.19248 1.01013C0.814766 2.14353 1.05609 3.34048 1.843 4.14552C2.26269 4.5904 2.16826 4.65396 1.4443 4.38914C1.19248 4.3044 0.972149 4.24085 0.951164 4.27263C0.877719 4.34677 1.12953 5.31069 1.32888 5.69202C1.60168 6.22165 2.15777 6.74068 2.76631 7.04787L3.28043 7.2915L2.67188 7.30209C2.08432 7.30209 2.06334 7.31268 2.12629 7.53512C2.33613 8.22364 3.16502 8.95452 4.08833 9.2723L4.73884 9.49474L4.17227 9.8337C3.33289 10.321 2.34663 10.5964 1.36036 10.6175C0.888211 10.6281 0.5 10.6705 0.5 10.7023C0.5 10.8082 1.78005 11.4014 2.52499 11.6344C4.75983 12.3229 7.41435 12.0264 9.40787 10.8506C10.8243 10.0138 12.2408 8.35075 12.9018 6.74068C13.2585 5.88269 13.6152 4.315 13.6152 3.56293C13.6152 3.07567 13.6467 3.01212 14.2343 2.42953C14.5805 2.09056 14.9058 1.71983 14.9687 1.6139C15.0737 1.41264 15.0632 1.41264 14.5281 1.59272C13.6362 1.91049 13.5103 1.86812 13.951 1.39146C14.2762 1.0525 14.6645 0.438131 14.6645 0.258058C14.6645 0.22628 14.5071 0.279243 14.3287 0.374576C14.1398 0.480501 13.7202 0.639389 13.4054 0.734722L12.8388 0.914795L12.3247 0.565241C12.0414 0.374576 11.6427 0.162725 11.4329 0.0991699C10.8978 -0.0491255 10.0794 -0.0279404 9.59673 0.14154C8.2852 0.618204 7.45632 1.84694 7.55075 3.19219Z" />
                  </svg>
                </a>
                <a className="gl" href="#">
                  <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                    <path d="M473.16 221.48l-2.26-9.59H262.46v88.22H387c-12.93 61.4-72.93 93.72-121.94 93.72-35.66 0-73.25-15-98.13-39.11a140.08 140.08 0 01-41.8-98.88c0-37.16 16.7-74.33 41-98.78s61-38.13 97.49-38.13c41.79 0 71.74 22.19 82.94 32.31l62.69-62.36C390.86 72.72 340.34 32 261.6 32c-60.75 0-119 23.27-161.58 65.71C58 139.5 36.25 199.93 36.25 256s20.58 113.48 61.3 155.6c43.51 44.92 105.13 68.4 168.58 68.4 57.73 0 112.45-22.62 151.45-63.66 38.34-40.4 58.17-96.3 58.17-154.9 0-24.67-2.48-39.32-2.59-39.96z" />
                  </svg>
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;