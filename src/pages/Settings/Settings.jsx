import sound from "../../assets/forest_sounds.mp3";
import React, { useEffect, useState, useContext } from "react";
import { FaVolumeUp, FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Import sound icon and arrows
import "./Settings.css";
import { AudioContext } from '../../context/AudioContext';
import ThemeToggle from '../../components/ThemeToggle';


import { useNavigate } from "react-router-dom";

function Setting() {
  const { isPlaying, toggleAudio } = useContext(AudioContext);
  const navigate = useNavigate(); // Initialize the navigate function!!
  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="icon-container">
        <div className="circle">
          <FaVolumeUp className="sound-icon" />
        </div>
      </div>

      <div className="options-container">
        <div className="option">
          <label className="selection-display-text">Mute:</label>
          <div className="button-group">
            <button className="side-by-side-button" onClick={toggleAudio}>
              {isPlaying ? "Turn off" : "Turn on"}
            </button>

          </div>
        </div>

        <div className="option">
          <label className="selection-display-text">Effect:</label>
          <div className="button-group">
            <button className="side-by-side-button"><label className="button-text">On</label></button>

          </div>
        </div>

        <div>
          <ThemeToggle></ThemeToggle>
        </div>
        <div>
          <button onClick={()=> navigate('/')}>Main Menu</button>
        </div>
      </div>
    </div>
  );
}

export default Setting;
