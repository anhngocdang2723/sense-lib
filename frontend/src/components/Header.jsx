import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">SenseLib</div>
      <nav className="nav">
        <Link to="/login" className="login-link">Đăng nhập</Link>
      </nav>
    </header>
  );
}

export default Header; 