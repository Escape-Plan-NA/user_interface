import React, { useEffect } from 'react';
import './PopupMessage.css';

const PopupMessage = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); // Disappear after 2 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup-message">
      {message}
    </div>
  );
};

export default PopupMessage;