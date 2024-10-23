import React from 'react';
import './Scoreboard.css';
import { useNavigate } from 'react-router-dom';

const Scoreboard = ({ farmerScore, thiefScore, onRetry }) => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate('/'); // Navigate to the main menu
  };

  return (
    <div className="scoreboard">
      <h3>Scoreboard</h3>
      <div className="scoreboard-item">
        <span>Farmer:</span>
        <span className="score-value">{farmerScore}</span>
      </div>
      <div className="scoreboard-item">
        <span>Thief:</span>
        <span className="score-value">{thiefScore}</span>
      </div>
      <div className="scoreboard-buttons">
        <button className="retry-button" onClick={onRetry}>Retry</button>
        <button className="exit-button" onClick={handleExit}>Exit</button>
      </div>
    </div>
  );
};

export default Scoreboard;
