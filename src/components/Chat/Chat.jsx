// components/Chat/Chat.jsx
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketProvider';
import './Chat.css';

const Chat = ({username}) => {
  const { socket } = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('chatMessage', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    const messageData = {
      username: username, // Replace with actual username logic
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    socket.emit('chatMessage', messageData);
    setInputMessage('');
  };

  return (
    <div className="chat-container">
      <ul className="message-list">
        {messages.map((msg, index) => (
          <li key={index} className="message-item">
            <span className="username">{msg.username}:</span> {msg.message} <span className="timestamp">{msg.timestamp}</span>
          </li>
        ))}
      </ul>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default Chat;
