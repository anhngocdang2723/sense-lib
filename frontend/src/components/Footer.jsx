import './Footer.css';
import logo from '../assets/original.png';

function Footer() {
    return (
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-info">
              <div className="footer-logo">
                <img src={logo} alt="Logo" className="logo" />
              </div>
              <ul className="contact-info">
                <li>
                  <div className="info-item">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.50163 0.658203C5.30647 0.658203 2.70703 3.25764 2.70703 6.45277C2.70703 10.418 7.89262 16.2392 8.11341 16.4851C8.32078 16.7161 8.68284 16.7157 8.88984 16.4851C9.11063 16.2392 14.2962 10.418 14.2962 6.45277C14.2962 3.25764 11.6968 0.658203 8.50163 0.658203ZM8.50163 9.36817C6.89406 9.36817 5.58625 8.06033 5.58625 6.45277C5.58625 4.8452 6.89409 3.53739 8.50163 3.53739C10.1092 3.53739 11.417 4.84523 11.417 6.4528C11.417 8.06036 10.1092 9.36817 8.50163 9.36817Z" fill="#4051c2"/>
                    </svg>
                    <span>182 Lê Duẩn, Vinh, Nghệ An, Việt Nam</span>
                  </div>
                </li>
                <li>
                  <div className="info-item">
                    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.0173 12.0433C15.3116 10.5699 14.1078 9.60851 12.3882 9.17946C12.1298 9.11501 11.8554 9.17903 11.6492 9.34749L10.221 10.5145C9.94214 10.7423 9.54798 10.7717 9.24148 10.5826C7.73071 9.65066 6.50832 8.42828 5.57639 6.91751C5.38732 6.611 5.41667 6.21685 5.64453 5.93798L6.8115 4.50978C6.97995 4.3036 7.04398 4.02915 6.97952 3.77083C6.55048 2.05121 5.58914 0.847433 4.1157 0.141685C3.87799 0.0278211 3.59758 0.0341813 3.36509 0.158353C2.62416 0.554053 1.9153 1.00179 1.24372 1.50527C0.986575 1.69805 0.856826 2.01681 0.910336 2.33371C1.39311 5.19298 2.93804 8.19979 5.44863 10.7104C7.9592 13.2209 10.966 14.7659 13.8253 15.2487C14.1422 15.3022 14.4609 15.1724 14.6537 14.9153C15.1572 14.2437 15.6049 13.5348 16.0006 12.7939C16.1248 12.5614 16.1312 12.281 16.0173 12.0433Z" fill="#4051c2"/>
                    </svg>
                    <span>0912 12 55 48</span>
                  </div>
                </li>
                <li>
                  <div className="info-item">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.1946 5.6582C10.6671 3.2082 9.54209 1.6582 8.50159 1.6582C7.46109 1.6582 6.33609 3.2082 5.80859 5.6582H11.1946Z" fill="#4051c2"/>
                      <path d="M5.5 8.6582C5.49988 9.3271 5.54448 9.99526 5.6335 10.6582H11.3665C11.4555 9.99526 11.5001 9.3271 11.5 8.6582C11.5001 7.98931 11.4555 7.32115 11.3665 6.6582H5.6335C5.54448 7.32115 5.49988 7.98931 5.5 8.6582Z" fill="#4051c2"/>
                      <path d="M5.80859 11.6582C6.33609 14.1082 7.46109 15.6582 8.50159 15.6582C9.54209 15.6582 10.6671 14.1082 11.1946 11.6582H5.80859Z" fill="#4051c2"/>
                    </svg>
                    <a href="https://thuvensachso.edu.vn" target="_blank" rel="noopener noreferrer">https://thuvensachso.edu.vn</a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="footer-links">
              <div className="link-group">
                <h3>Học liệu số</h3>
                <ul>
                  <li><a href="/stem-learning-material">Học liệu STEM</a></li>
                  <li><a href="/digital-learning-material">Học liệu Tiếng Anh</a></li>
                </ul>
              </div>
              <div className="link-group">
                <a href="/my-library">Thư viện cá nhân</a>
              </div>
              <div className="link-group">
                <a href="/introduce">Giới thiệu</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <a href="/privacy" className="privacy-link">Chính sách bảo mật và Điều khoản dịch vụ</a>
            <span className="copyright">© 2024 Minh Việt SJC. All Rights Reserved. | Contact: 0912 12 55 48</span>
          </div>
        </div>
      </footer>
    );
}

export default Footer; 