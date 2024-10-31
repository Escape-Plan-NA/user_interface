import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import '../../index.css';

const SingleplayerModeSelection = () => {
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');

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
    <div className="singleplayer-mode-container">
      <h2>Select Mode</h2>
      <button id="bot-mode-button" onClick={() => handleModeSelection('bot')}>Play with Bot</button>
      <button id="friends-mode-button" onClick={() => handleModeSelection('friends')}>Play with Friends</button>

      {showRoleModal && (
        <div className="role-modal">
          <h3>Select Your Role</h3>
          <button onClick={() => handleRoleSelection('farmer')}>Farmer</button>
          <button onClick={() => handleRoleSelection('thief')}>Thief</button>
        </div>
      )}
    </div>
  );
};

export default SingleplayerModeSelection;
