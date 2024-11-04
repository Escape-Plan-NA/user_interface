// components/Navbar/GameNavBar.jsx
import React, { useContext } from "react";
import { FaVolumeUp, FaMusic, FaHome } from "react-icons/fa"; // Import icons
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
      <button className="nav-icon" onClick={() => navigate('/')}>
        <FaHome title="Home" />
      </button>
      <button className="nav-icon" onClick={toggleAudio}>
        <FaVolumeUp title="Toggle Audio" style={{ color: isPlaying ? "#2f993d" : "#888" }} />
      </button>
      <button className="nav-icon" onClick={toggleSoundEffects}>
        <FaMusic title="Toggle Sound Effects" style={{ color: soundEffectsEnabled ? "#2f993d" : "#888" }} />
      </button>
      <ThemeToggle /> {/* Render ThemeToggle directly here */}
    </div>
  );
}

export default GameNavBar;
