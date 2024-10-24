import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import '../../index.css';

const Menu = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      <h1>ESCAPE PLAN</h1>
      <button id="start-button" onClick={() => navigate('/lobby')}>Multiplayer</button>
      <button id="start-button" onClick={() => navigate('/singledevice')}>Singleplayer</button> 
      <button id="settings" onClick={() => navigate('/setting')}>Settings</button>
    </div>
  );
};

export default Menu;
