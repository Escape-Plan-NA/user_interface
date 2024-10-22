// src/pages/GamePlay/SingleplayerModeSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import '../../index.css';

const SingleplayerModeSelection = () => {
  const navigate = useNavigate();

  const handleModeSelection = (mode) => {
    // Navigate to cutscene with mode (bot or friends) as state
    navigate('/singlecutscene', { state: { mode } });
  };

  return (
    <div className="singleplayer-mode-container">
      <h2>Select Mode</h2>
      <button id="bot-mode-button" onClick={() => handleModeSelection('bot')}>Play with Bot</button>
      <button id="friends-mode-button" onClick={() => handleModeSelection('friends')}>Play with Friends</button>
    </div>
  );
};

export default SingleplayerModeSelection;
