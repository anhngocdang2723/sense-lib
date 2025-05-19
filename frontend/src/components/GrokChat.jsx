import React, { useState, useRef, useEffect } from 'react';
import api, { endpoints } from '../api/api';
import './GrokChat.css';

const INITIAL_SYSTEM_CONTEXT = {
  role: 'assistant',
  content: `Xin chào! Tôi là trợ lý AI của SenseLib - Thư viện số thông minh. Tôi có thể giúp bạn:

• Tìm kiếm sách theo chủ đề, tác giả hoặc từ khóa
• Gợi ý sách phù hợp với sở thích và trình độ của bạn
• Giải thích và phân tích nội dung sách
• Hướng dẫn sử dụng các tính năng của thư viện
• Trả lời các câu hỏi về tài liệu và học liệu

Hãy cho tôi biết bạn cần giúp đỡ gì nhé!`
};

const GrokChat = () => {
  const [messages, setMessages] = useState([INITIAL_SYSTEM_CONTEXT]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await api.get(endpoints.grok.history);
        if (response.data && Array.isArray(response.data.messages) && response.data.messages.length > 0) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    loadHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post(endpoints.grok.chat, {
        message: userMessage,
        context: {
          system_prompt: "Bạn là trợ lý AI của thư viện số SenseLib. Hãy trả lời bằng tiếng Việt và tập trung vào các chủ đề liên quan đến thư viện, sách, tài liệu học tập, và các dịch vụ của SenseLib. Giọng điệu thân thiện, chuyên nghiệp và hữu ích.",
          language: "vi",
          max_length: 500
        }
      });

      if (response.data && response.data.answer) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp tục.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await api.post(endpoints.grok.clearHistory);
      setMessages([INITIAL_SYSTEM_CONTEXT]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const renderSuggestions = () => (
    <div className="chat-suggestions">
      <p>Bạn có thể hỏi những câu như:</p>
      <button 
        onClick={() => setInput("Giới thiệu cho tôi một số sách về lập trình")}
        className="suggestion-button"
      >
        Giới thiệu sách về lập trình
      </button>
      <button 
        onClick={() => setInput("Làm thế nào để tải sách về máy?")}
        className="suggestion-button"
      >
        Cách tải sách
      </button>
      <button 
        onClick={() => setInput("Có sách nào phù hợp cho người mới học không?")}
        className="suggestion-button"
      >
        Sách cho người mới
      </button>
    </div>
  );

  return (
    <div className={`grok-chat-container ${isOpen ? 'open' : ''}`}>
      <button className="chat-toggle-button" onClick={toggleChat}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Trợ lý SenseLib</h3>
            <button className="clear-history-button" onClick={clearHistory}>
              Xóa lịch sử
            </button>
          </div>

          <div className="messages-container" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && renderSuggestions()}

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GrokChat; 