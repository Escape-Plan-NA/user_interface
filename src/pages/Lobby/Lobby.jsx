import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Lobby.css'; // Local CSS file for this component

const Lobby = () => {
  const [playerName, setPlayerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [profilePicture, setProfilePicture] = useState('src/assets/placeholderProfile.jpg');
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current image index

  const imageOptions = [
    "src/assets/customize/cyan.jpg",
    "src/assets/customize/mario.jpg",
    "src/assets/customize/orange.jpg",
    "src/assets/customize/red.jpg",
    "src/assets/customize/spiderman.jpg",
    "src/assets/customize/squidgame.jpg",
  ];

  const navigate = useNavigate();

  // Function to open the customization modal
  const handleCustomize = (e) => {
    e.preventDefault();
    setIsModalOpen(true); // Open customization modal
  };

  // Function to handle navigation to the game page
  const handleStartGame = (e) => {
    e.preventDefault();
    // Simply navigate to the next page
    navigate('/start');
  };

  // Handle profile picture change on arrow click
  const handleArrowClick = (direction) => {
    if (direction === 'left') {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? imageOptions.length - 1 : prevIndex - 1));
    } else {
      setCurrentIndex((prevIndex) => (prevIndex === imageOptions.length - 1 ? 0 : prevIndex + 1));
    }
    setProfilePicture(imageOptions[currentIndex]);  // Update the profile picture as the user navigates
  };

  // Save the game state inside the modal
  const handleSaveGameState = async () => {
    const newProfilePicture = imageOptions[currentIndex];  // Set the selected picture
    setProfilePicture(newProfilePicture);  // Update profile picture in state

    const newUser = {
      name: playerName,
      profilePicture: newProfilePicture,
    };

    try {
      // Post the user object to the server
      await axios.post('http://localhost:3000/users/setUser', newUser);
      console.log('User data saved to server:', newUser);
      
      // Close the modal after saving
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user data to the server:", error);
    }
  };

  return (
    <div className="lobby-container">
      {/* Display current profile picture */}
      <div className="profile-preview">
        <img src={profilePicture} alt="Current Profile" className="current-profile-pic" />
      </div>

      {/* Form for player name */}
      <form>
        <input
          className="enter-info"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        {/* Separate buttons for Start Game and Customize */}
        <div>
          <button onClick={handleStartGame}>Start Game</button> {/* Just navigate to the game page */}
          <button onClick={handleCustomize}>Customize</button> {/* Open customization modal */}
        </div>
      </form>

      {/* Customization Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Customize Your Character</h2>
            <p>Player: {playerName || "Guest"}</p> {/* Show the player name */}

            <div className="arrow-container">
              <button className="arrow left-arrow" onClick={() => handleArrowClick('left')}>&lt;</button>
              <img
                src={imageOptions[currentIndex]}
                alt={`Option ${currentIndex + 1}`}
                className="option-img"
              />
              <button className="arrow right-arrow" onClick={() => handleArrowClick('right')}>&gt;</button>
            </div>

            <div className="modal-actions">
              <button onClick={handleSaveGameState}>Save</button> {/* Save game state */}
              <button onClick={() => setIsModalOpen(false)}>Close</button> {/* Option to close modal */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
