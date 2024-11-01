import React, { useState } from 'react'; // Import useState from React
import './SettingsModal.css'; // Import CSS file for styling (optional)
import TutorialModal from '../Tutorial/TutorialModal.jsx'; // Correct path to your TutorialModal

const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [isTutorialOpen, setIsTutorialOpen] = useState(false); // Initialize state for tutorial visibility

  const openTutorial = () => setIsTutorialOpen(true);
  const closeTutorial = () => setIsTutorialOpen(false);

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h2>Settings</h2>

        <div className='tutorial-button'>
            <button onClick={openTutorial}>Open Tutorial</button>
            {/* TutorialModal will be rendered here based on the isTutorialOpen state */}
            <TutorialModal isOpen={isTutorialOpen} onClose={closeTutorial} />
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SettingsModal;
