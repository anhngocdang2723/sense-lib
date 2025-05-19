import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaClock, FaPaperPlane } from 'react-icons/fa';
import './Contact.css'; // Import CSS file

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // TODO: Implement actual form submission logic (e.g., send to backend API)
    console.log('Form submitted:', formData);

    // Simulate API call
    try {
      // Replace with actual API call (e.g., using axios or fetch)
      // const response = await api.post(endpoints.contactForm, formData);
      // if (response.status === 200) {
      //   setSubmitStatus('success');
      //   setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
      // } else {
      //   setSubmitStatus('error');
      // }

      // Simulate success for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Địa chỉ",
      content: "182 Lê Duẩn, Vinh, Nghệ An, Việt Nam"
    },
    {
      icon: <FaPhone />,
      title: "Điện thoại",
      content: "0912 12 55 48"
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      content: "support@senselib.com"
    },
    {
      icon: <FaGlobe />,
      title: "Trang web",
      content: "https://thuvensachso.edu.vn",
      isLink: true
    },
    {
      icon: <FaClock />,
      title: "Giờ làm việc",
      content: "Thứ Hai - Thứ Sáu, 9:00 AM - 5:00 PM"
    }
  ];

  return (
    <div className="contact-page">
      <motion.div 
        className="contact-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Liên hệ với chúng tôi</h1>
        <p className="contact-intro">Chúng tôi luôn sẵn lòng lắng nghe ý kiến và phản hồi của bạn</p>
      </motion.div>

      <div className="contact-container">
        <motion.div 
          className="contact-info"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h2>Thông tin liên hệ</h2>
          <div className="info-grid">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                className="info-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="info-icon">{info.icon}</div>
                <h3>{info.title}</h3>
                {info.isLink ? (
                  <a href={info.content} target="_blank" rel="noopener noreferrer">{info.content}</a>
                ) : (
                  <p>{info.content}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="contact-form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h2>Gửi tin nhắn cho chúng tôi</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Tiêu đề</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Nội dung</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? 'Đang gửi...' : (
                <>
                  <FaPaperPlane /> Gửi tin nhắn
                </>
              )}
            </motion.button>

            {submitStatus === 'success' && (
              <motion.p 
                className="submit-success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
              </motion.p>
            )}
            {submitStatus === 'error' && (
              <motion.p 
                className="submit-error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.
              </motion.p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact; 