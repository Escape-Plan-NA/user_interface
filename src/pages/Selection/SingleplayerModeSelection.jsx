import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import '../../index.css';
import SpringMenu from '/map_components/spring/Spring BG.gif';

import SummerMenu from '/map_components/summer/Summer BG.gif';
import AutumnMenu from '/map_components/autumn/Autumn BG.gif';
import './SingleplayerModeSelection.css'
const SingleplayerModeSelection = () => {
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');

  const backgroundImages = [SpringMenu, SummerMenu, AutumnMenu];
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  
  useEffect(() => {
    console.log("Initial Background Image URL:", backgroundImages[backgroundIndex]);

    const interval = setInterval(() => {
      setBackgroundIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % backgroundImages.length;
        console.log("Switching to Background Image URL:", backgroundImages[newIndex]);
        return newIndex;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleModeSelection = (mode) => {
    if (mode === 'bot') {
      setSelectedMode(mode);
      setShowRoleModal(true); // Show role selection modal
    } else {
      // Navigate to cutscene with friends mode
      navigate('/singlecutscene', { state: { mode } });
    }
  };

  const handleRoleSelection = (role) => {
    // Navigate to cutscene with bot mode and selected role
    navigate('/singlecutscene', { state: { mode: selectedMode, role } });
  };

  return (
    <div className="singleplayer-mode-container"
    style={{ backgroundImage: `url(${backgroundImages[backgroundIndex]})` }}
    >
      
      <div className='content-wrapper'>
        <h2 className='select-mode'>Select Mode</h2>
        <button id="bot-mode-button" onClick={() => handleModeSelection('bot')}>Play with Bot</button>
        <button id="friends-mode-button" onClick={() => handleModeSelection('friends')}>Play with Friends</button>
      </div>
      {showRoleModal && (
        <div className="role-modal">
          <div className='role-modal-content'>
            <h3>Select Your Role</h3>
            <button onClick={() => handleRoleSelection('farmer')}>Farmer</button>
            <button onClick={() => handleRoleSelection('thief')}>Thief</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleplayerModeSelection;
