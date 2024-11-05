// components/Navbar/GameNavBar.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AudioContext } from '../../context/AudioContext';
import { SoundEffectContext } from '../../context/SoundEffectContext';
import ThemeToggle from '../../components/ThemeToggle';
import "./GameNavBar.css";

function GameNavBar() {
  const { isPlaying, toggleAudio } = useContext(AudioContext);
  const { soundEffectsEnabled, toggleSoundEffects } = useContext(SoundEffectContext);
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button className="nav-button" onClick={() => navigate('/')}>
        Home
      </button>
      <button 
        className={`nav-button ${isPlaying ? 'active' : ''}`} // Add 'active' class based on audio state
        onClick={toggleAudio}
      >
        {isPlaying ? "Audio On" : "Audio Off"}
      </button>
      <button 
        className={`nav-button ${soundEffectsEnabled ? 'active' : ''}`} // Add 'active' class based on sound effects state
        onClick={toggleSoundEffects}
      >
        {soundEffectsEnabled ? "Sound Effects On" : "Sound Effects Off"}
      </button>
      <ThemeToggle /> {/* Render ThemeToggle directly here */}
    </div>
  );
}

export default GameNavBar;
