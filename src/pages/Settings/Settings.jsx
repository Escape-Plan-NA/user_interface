import sound from "../../assets/forest_sounds.mp3";
import React, { useContext } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./Settings.css";
import { AudioContext } from '../../context/AudioContext';
import ThemeToggle from '../../components/ThemeToggle';
import { SoundEffectContext } from '../../context/SoundEffectContext';
import { useNavigate } from "react-router-dom";

function Setting() {
  const { isPlaying, toggleAudio } = useContext(AudioContext);
  const { soundEffectsEnabled, toggleSoundEffects } = useContext(SoundEffectContext);
  const navigate = useNavigate();

  return (
    <div className="background-container"> {/* Full-screen background */}
    <div className="back-button" onClick={() => navigate('/')}>
          <FaArrowLeft />
        </div>
      <div className="oval-board"> {/* Oval board for settings title */}
        <h2 className="settings-title">SETTINGS</h2>
      </div>
      <div className="settings-container"> {/* Brown settings panel */}
        {/* Back button */}

        {/* Music Toggle */}
        <div className="setting-label">
          <span>MUSIC</span>
          <label className="switch music">
            <input type="checkbox" checked={isPlaying} onChange={toggleAudio} />
            <span className="slider"></span>
          </label>
        </div>

        {/* Sound Effects Toggle */}
        <div className="setting-label">
          <span>SOUND EFFECT</span>
          <label className="switch sound">
            <input type="checkbox" checked={soundEffectsEnabled} onChange={toggleSoundEffects} />
            <span className="slider"></span>
          </label>
        </div>

        {/* Theme Toggle */}
        <div className="setting-label">
          <span>MODE</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default Setting;
