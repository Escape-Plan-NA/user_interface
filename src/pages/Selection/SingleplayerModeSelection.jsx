import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import '../../index.css';

const SingleplayerModeSelection = () => {
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedDifficulty, setDifficulty] = useState('');

  const handleModeSelection = (mode) => {
    setSelectedMode(mode);
    if (mode === 'bot') {
      setShowDifficulty(true);
      setShowRoleModal(false); // Show role selection modal
    } else {
      // Navigate to cutscene with friends mode
      navigate('/singlecutscene', { state: { mode } });
    }
  };

  const handleDifficultySelection = (difficulty) => {
    setDifficulty(difficulty);
    setShowRoleModal(true);
  };

  const handleRoleSelection = (role) => {
    // Navigate to cutscene with bot mode and selected role
    navigate('/singlecutscene', { state: { mode: selectedMode, role, difficulty: selectedDifficulty } });
  };

  return (
    <div className="singleplayer-mode-container">
      <h2>Select Mode</h2>
      <button id="bot-mode-button" onClick={() => handleModeSelection('bot')}>Play with Bot</button>
      <button id="friends-mode-button" onClick={() => handleModeSelection('friends')}>Play with Friends</button>

      {showDifficulty && (
        <div className="difficulty-mode">
          <h3>Select Your Level</h3>
          <button onClick={() => handleDifficultySelection('easy')}>EASY</button>
          <button onClick={() => handleDifficultySelection('hard')}>HARD</button>
        </div>
      )}

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
