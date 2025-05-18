import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Header.css';
import logo from '../assets/original.png';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="logo" />
        <span className="library-name">SenseLib</span>
      </div>

      <div className="navbar-center">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Tìm kiếm học liệu, tài liệu..."
        />
      </div>

      <button className="mobile-menu-button" onClick={toggleMenu} aria-label="Toggle menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={isMenuOpen ? 
            "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" : 
            "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"} 
            fill="currentColor"/>
        </svg>
      </button>

      <div className={`navbar-right ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/resources" className="nav-button" onClick={() => setIsMenuOpen(false)}>Học liệu số</Link>
        <Link to="/library" className="nav-button" onClick={() => setIsMenuOpen(false)}>Thư viện cá nhân</Link>
        <Link to="/about" className="nav-button" onClick={() => setIsMenuOpen(false)}>Giới thiệu</Link>
        <Link to="/login" className="login-button" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
      </div>
    </nav>
  );
}

export default Header; 