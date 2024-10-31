import React from 'react';
import './GameHeader.css';

const GameHeader = ({ role, timeLeft, turn, turnTimeLeft, username}) => {
  return (
    <div className="game-header">
      <h2>Your role is: {role === "farmer" ? "Farmer" : "Thief"}</h2>
      <p>Time left: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
      <p>Turn: {turn === "farmer" ? "Farmer" : "Thief"}</p>
      <p>Turn time left: {turnTimeLeft} seconds</p>
    </div>
  );
};

export default GameHeader;
