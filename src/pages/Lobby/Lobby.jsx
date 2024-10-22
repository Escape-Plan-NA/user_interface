import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Lobby.css'; // Assuming you'll have some styles for the lobby

const Lobby = () => {
  const [playerName, setPlayerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [profilePicture, setProfilePicture] = useState("src/assets/placeholderProfile.jpg");
  const [imageOptions, setImageOptions] = useState([]);
  const navigate = useNavigate();

  const girlImages = [
    "src/assets/dora_explorer_show.jpg", 
    "src/assets/dora_explorer_show.jpg", 
    "src/assets/dora_explorer_show.jpg"
  ];
  const boyImages = [
    "src/assets/Diego.jpg", 
    "src/assets/Diego.jpg", 
    "src/assets/Diego.jpg"
  ];

  // Function to open the customization modal
  const handleCustomize = (e) => {
    e.preventDefault();
    localStorage.setItem('playerName', playerName);
    setIsModalOpen(true); // Open customization modal
  };

  // Function to handle sending player name to the server and navigating to the game page
  const handleStartGame = async (e) => {
    e.preventDefault();

    try {
      // Send the player name to the server (assuming your API endpoint is /api/start)
      await axios.post('http://localhost:3000/api/setName', { name: playerName });

      // Store player name in localStorage
      localStorage.setItem('playerName', playerName);
      console.log("playerName sent to server")

      // Navigate to the next page (e.g., '/start')
      navigate('/start');
    } catch (error) {
      console.error("Error sending player name to the server:", error);
    }
  };

  
  

  const handleBoyCharacter = () => {
    setImageOptions(boyImages);
  };

  const handleGirlCharacter = () => {
    setImageOptions(girlImages);
  };

  const handleProfilePictureChange = (url) => {
    setProfilePicture(url);
    localStorage.setItem('profilePicture', url);
  };

  return (
    <div className="lobby-container">
      {/* Form for player name */}
      <form>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        {/* Separate buttons for Start Game and Customize */}
        <button onClick={handleStartGame}>Start Game</button> {/* Send playerName to server and start game */}
        <button onClick={handleCustomize}>Customize</button> {/* Open customization modal */}
      </form>

      {/* Customization Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Customize Your Character</h2>
            <p>Player: {playerName || "Guest"}</p> {/* Show the player name */}

            <div className="character-selection">
              <button onClick={handleBoyCharacter}>Boy</button>
              <button onClick={handleGirlCharacter}>Girl</button>
            </div>

            <div className="image-options">
              {imageOptions.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Option ${index + 1}`}
                  className="option-img"
                  onClick={() => handleProfilePictureChange(url)}
                />
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)}>Close</button> {/* Option to close modal */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
