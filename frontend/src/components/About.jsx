import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaRobot, FaMicrophone, FaComments, FaSearch, FaDownload, FaHeart, FaUpload } from 'react-icons/fa';
import './About.css';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <FaBook />,
      title: "Thư viện số đa dạng",
      description: "Truy cập hàng ngàn tài liệu chất lượng cao với nhiều định dạng khác nhau"
    },
    {
      icon: <FaRobot />,
      title: "AI tóm tắt nội dung",
      description: "Sử dụng công nghệ AI để tóm tắt tài liệu, giúp bạn nắm bắt thông tin nhanh chóng"
    },
    {
      icon: <FaMicrophone />,
      title: "Chuyển văn bản thành giọng nói",
      description: "Nghe nội dung tài liệu với công nghệ chuyển văn bản thành giọng nói tiên tiến"
    },
    {
      icon: <FaComments />,
      title: "Chatbot thông minh",
      description: "Tương tác với chatbot để tìm hiểu sâu hơn về nội dung tài liệu"
    },
    {
      icon: <FaSearch />,
      title: "Tìm kiếm thông minh",
      description: "Tìm kiếm tài liệu nhanh chóng với công nghệ tìm kiếm tiên tiến"
    },
    {
      icon: <FaDownload />,
      title: "Tải xuống dễ dàng",
      description: "Tải xuống tài liệu ở nhiều định dạng khác nhau"
    },
    {
      icon: <FaHeart />,
      title: "Yêu thích và đánh giá",
      description: "Đánh dấu và đánh giá tài liệu yêu thích của bạn"
    },
    {
      icon: <FaUpload />,
      title: "Chia sẻ tài liệu",
      description: "Đóng góp tài liệu của bạn cho cộng đồng"
    }
  ];

  return (
    <div className="about-container">
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>SenseLib - Tri thức cho cộng đồng</h1>
        <p className="subtitle">Khám phá, học hỏi và chia sẻ tri thức trong một không gian số hiện đại</p>
      </motion.div>

      <motion.div 
        className="mission-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <h2>Sứ mệnh của chúng tôi</h2>
        <p>
          SenseLib được xây dựng với mục tiêu tạo ra một nền tảng thư viện số hiện đại, 
          tích hợp các công nghệ trí tuệ nhân tạo để nâng cao trải nghiệm người dùng. 
          Chúng tôi cam kết mang đến một không gian học tập và chia sẻ tri thức 
          thân thiện, hiệu quả và an toàn cho mọi người.
        </p>
      </motion.div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="ai-features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <h2>Công nghệ AI tiên tiến</h2>
        <div className="ai-features-grid">
          <div className="ai-feature">
            <h3>Tóm tắt nội dung thông minh</h3>
            <p>
              Sử dụng các mô hình NLP hiện đại để tóm tắt tài liệu một cách thông minh, 
              giúp bạn nắm bắt nội dung chính nhanh chóng.
            </p>
          </div>
          <div className="ai-feature">
            <h3>Chuyển văn bản thành giọng nói</h3>
            <p>
              Tích hợp công nghệ Text-to-Speech tiên tiến, cho phép bạn nghe nội dung 
              tài liệu với giọng đọc tự nhiên.
            </p>
          </div>
          <div className="ai-feature">
            <h3>Chatbot thông minh</h3>
            <p>
              Tương tác với chatbot được huấn luyện trên nội dung tài liệu, 
              giúp bạn tìm hiểu sâu hơn về các chủ đề quan tâm.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="join-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <h2>Tham gia cùng chúng tôi</h2>
        <p>
          Hãy trở thành một phần của cộng đồng SenseLib - nơi tri thức được chia sẻ 
          và phát triển. Đăng ký ngay hôm nay để khám phá kho tàng tri thức phong phú 
          và trải nghiệm các tính năng độc đáo của chúng tôi.
        </p>
      </motion.div>
    </div>
  );
};

export default About; 