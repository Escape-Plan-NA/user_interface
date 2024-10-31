import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ winMessage, farmerScore, thiefScore, farmerName, thiefName }) => {
  return (
    <div className="scoreboard">
      {winMessage ? (
        <>
        <div className="win-message">
          <span>{winMessage}</span>
          <div className="scoreboard-item">
            <span>{farmerName} (Farmer):</span>
            <span className="score-value">{farmerScore}</span>
          </div>
          <div className="scoreboard-item">
            <span>{thiefName} (Thief):</span>
            <span className="score-value">{thiefScore}</span>
          </div>
        </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Scoreboard;

