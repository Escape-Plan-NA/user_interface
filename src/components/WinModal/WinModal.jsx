// src/components/WinModal/WinModal.jsx
import React from "react";
import './WinModal.css'; // You can create a CSS file for styling

const WinModal = ({ message, role, scores, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{message}</h2>
        <p>{role === "farmer" ? "Farmer (Warder)" : "Thief (Prisoner)"} wins!</p>
        <p>Scores:</p>
        <p>👨‍🌾 Farmer (Warder): {scores.farmer}</p>
        <p>🕵️‍♂️ Thief (Prisoner): {scores.thief}</p>
        <button onClick={onClose}>Continue</button>
      </div>
    </div>
  );
};

export default WinModal;
