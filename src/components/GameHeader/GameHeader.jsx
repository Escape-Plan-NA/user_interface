import React from 'react';
import './GameHeader.css';

const GameHeader = ({ role, timeLeft, turn, turnTimeLeft, username}) => {
  return (
    <div className="game-header">
      <h1>Gameplay Page</h1>
      <h2>Username: {username}</h2>
      <h2>Your role is: {role === "farmer" ? "👨‍🌾 Farmer (Warder)" : "🕵️‍♂️ Thief (Prisoner)"}</h2>
      <p>Time left: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
      <p>Turn: {turn === "farmer" ? "👨‍🌾 Farmer (Warder)" : "🕵️‍♂️ Thief (Prisoner)"}</p>
      <p>Turn time left: {turnTimeLeft} seconds</p>
    </div>
  );
};

export default GameHeader;
