// TutorialModal.jsx
import React from 'react';
import './TutorialModal.css'; // Import CSS file for styling (optional)
import tutorialGif from '../../assets/tutorial/Tutorial.gif'

const TutorialModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="tutorial-modal-overlay">

      <div className="tutorial-modal">
        <img src={tutorialGif} 
             className="tutorial-gif"/>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default TutorialModal;