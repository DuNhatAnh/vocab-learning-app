import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { api } from '../api/api';
import './AITutor.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const CHAT_SESSION_STORAGE_KEY = 'ai-tutor-session-id';

const getChatSessionId = () => {
  const savedSessionId = window.sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY);
  if (savedSessionId) {
    return savedSessionId;
  }

  const newSessionId = window.crypto?.randomUUID?.() ?? `chat-${Date.now()}`;
  window.sessionStorage.setItem(CHAT_SESSION_STORAGE_KEY, newSessionId);
  return newSessionId;
};

const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Chào bạn! Tôi có thể cho từ mới để luyện, gợi ý mẫu câu, giải nghĩa từ, hoặc sửa một câu tiếng Anh ngắn.",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatSessionId] = useState(getChatSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Gọi API thực tế từ Backend
    try {
      const response = await api.sendChatMessage(inputValue, chatSessionId);
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Xin lỗi, tôi đang gặp trục trặc khi kết nối với máy chủ.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="ai-tutor-container">
      <header className="ai-tutor-header">
        <Bot size={28} className="ai-icon" />
        <div className="header-info">
          <h1>AI Tutor</h1>
          <span>Trực tuyến</span>
        </div>
      </header>

      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-item ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="message-content">
              <p>{msg.text}</p>
              <span className="timestamp">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!inputValue.trim()}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AITutor;
