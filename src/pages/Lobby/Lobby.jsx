import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Lobby.css'; // Local CSS file for this component

const Lobby = () => {
  const [playerName, setPlayerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [profilePicture, setProfilePicture] = useState('src/assets/placeholderProfile.jpg');
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current image index
  const [userId, setUserId] = useState(''); // Track the user ID

  const imageOptions = [
    "src/assets/customize/cyan.jpg",
    "src/assets/customize/mario.jpg",
    "src/assets/customize/orange.jpg",
    "src/assets/customize/red.jpg",
    "src/assets/customize/spiderman.jpg",
    "src/assets/customize/squidgame.jpg",
  ];

  const navigate = useNavigate();

  // Function to handle clearing user data on page reload or game restart
  const handlePageReloadOrRestart = async () => {
    try {
      await axios.post('http://localhost:3000/users/removeUser');
      console.log('User data cleared from server');
    } catch (error) {
      console.error('Error clearing user data from the server:', error);
    }
  };

  // Call the function to clear user data when the component unmounts (i.e., when reloading the page)
  useEffect(() => {
    window.addEventListener('beforeunload', handlePageReloadOrRestart);
    return () => {
      window.removeEventListener('beforeunload', handlePageReloadOrRestart);
    };
  }, []);

  // Function to open the customization modal
  const handleCustomize = (e) => {
    e.preventDefault();
    const finalPlayerName = playerName || "Guest"; // Use "Guest" if playerName is empty
    setPlayerName(finalPlayerName);

    setIsModalOpen(true); // Open customization modal
  };

  // Function to handle navigation to the game page
  const handleStartGame = async (e) => {
    e.preventDefault();
    const finalPlayerName = playerName || "Guest"; // If playerName is empty, use "Guest"
  
    try {
      // Send the user data (name and profile picture) in a single request
      const response = await axios.post('http://localhost:3000/users/setUser', { 
        name: finalPlayerName, 
        profilePicture 
      });
      console.log('User data set:', response.data);

      const userId = response.data.user.userId;  // Get the generated userId
      setUserId(userId);  // Store the userId in state

      console.log('Generated User ID:', userId);

      // Update the connected status using the generated userId
      await axios.put('http://localhost:3000/games/update-user', { 
        role: 'thief',  // Update based on the role (you can also handle farmer here)
        userId: userId, 
      });

      // Navigate to the game after successfully updating the connection status
      navigate('/start');  // Navigate to the main game here
    } catch (error) {
      console.error('Error setting user data or updating connection status:', error);
    }
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

  // Save the game state inside the modal (without sending to server)
  const handleSaveGameState = () => {
    const newProfilePicture = imageOptions[currentIndex];  // Set the selected picture
    setProfilePicture(newProfilePicture);  // Update profile picture in state

    // Just store the player name (or "Guest") and profile picture in the state
    setPlayerName(playerName || "Guest");

    // Close the modal after saving
    setIsModalOpen(false);
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
          <button type="button" onClick={handleStartGame}>Start Game</button> {/* Just navigate to the game page */}
          <button type="button" onClick={handleCustomize}>Customize</button> {/* Open customization modal */}
        </div>
      </form>

      {/* Display generated user ID */}
      {userId && <p>Generated User ID: {userId}</p>}

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
