import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ farmerScore, thiefScore, farmerName, thiefName }) => {
  return (
      <div className="scoreboard-normal">
        <h3>Scoreboard</h3>
        <div className="scoreboard-item">
          <span>{farmerName} (Farmer):</span>
          <span className="score-value">{farmerScore}</span>
        </div>
        <div className="scoreboard-item">
          <span>{thiefName} (Thief):</span>
          <span className="score-value">{thiefScore}</span>
        </div>
      </div>
  );
};

export default Scoreboard;
