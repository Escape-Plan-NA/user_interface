import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../context/WebSocketProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { imageMap } from '../../utils/imageMap';
import './Lobby.css';

const Lobby = () => {
  const { socket, isConnected } = useWebSocket();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('Guest');
  const [profilePictureId, setProfilePictureId] = useState('white');
  const [selectedUsername, setSelectedUsername] = useState('Guest');
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasJoinedLobby = useRef(false);
  const [role, setRole] = useState(null);
  const [connectedPlayerCount, setConnectedPlayerCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [inProgressMessage, setInProgressMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [startingMessage, setStartingMessage] = useState(''); // New state for "starting ..." message
  const [theme,setTheme]= useState('autumn');

  const profilePicture = imageMap[profilePictureId].base;

  useEffect(() => {
    const fetchRole = async () => {
      if (socket?.id) {
        try {
          const response = await axios.get(`http://127.0.0.1:3000/api/get-role/${socket.id}`);
          const assignedRole = response.data.role;
          setRole(assignedRole);
          console.log(`Assigned role: ${assignedRole}`);
        } catch (error) {
          console.error("Error fetching role:", error.response?.data || error.message);
        }
      }
    };

    fetchRole();
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    if (!hasJoinedLobby.current && socket) {
      socket.emit('joinLobby');
      hasJoinedLobby.current = true;
    }

    socket.on('connectedPlayerCount', (count) => {
      console.log('Updated connected player count:', count);
      setConnectedPlayerCount(count);
    });

    socket.on('playerConnected', ({ role: assignedRole }) => {
      console.log(`Player connected with role: ${assignedRole}`);
    });

    socket.on('playerDisconnected', () => {
      console.log("A player disconnected");
    });

    socket.on('gameStarted', () => setGameStarted(true));
    socket.on('gameInProgress', ({ message }) => setInProgressMessage(message));

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      socket.off('connectedPlayerCount');
      socket.off('playerConnected');
      socket.off('playerDisconnected');
      socket.off('gameStarted');
      socket.off('gameInProgress');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    if (gameStarted && role) {
      setStartingMessage("Starting ..."); // Show the "starting ..." message
      setTimeout(() => navigate('/cutscene', { state: { role, username, theme} }), 1800); // Delay navigation by
    }
  }, [gameStarted, role, navigate, theme]);

  const handleCustomize = (e) => {
    e.preventDefault();
    setSelectedUsername(username);
    setIsModalOpen(true);
  };

  const handleArrowClick = (direction) => {
    const ids = Object.keys(imageMap);
    setCurrentIndex((prevIndex) => {
      const newIndex = direction === 'left'
        ? (prevIndex === 0 ? ids.length - 1 : prevIndex - 1)
        : (prevIndex === ids.length - 1 ? 0 : prevIndex + 1);
      
      setProfilePictureId(ids[newIndex]);
      return newIndex;
    });
  };

  const handleStartGame = () => {
    console.log("Start Game button clicked");

    if (!username.trim()) {
      console.error("No username provided. Please enter a username.");
      alert("Please enter a username.");
      return;
    }

    if (!role) {
      console.error("No role assigned yet. Cannot start the game.");
      return;
    }
  
    socket.emit('playerReady', { 
      userId: socket.id,
      username, 
      profilePictureId 
    });

    console.log(`Emitted 'playerReady' event for ${username}`);
    setButtonPressed(true);
  };

  const handleSaveGameState = () => {
    setUsername(selectedUsername);
    setIsModalOpen(false);
  };

  // Theme selection handler
  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };


  return (
    <div className="lobby-container">
      <h2>Game Lobby</h2>
  
      <div className="player-avatar">
        <img src={profilePicture} alt="Your Character" className="current-profile-pic" />
        <p className="enter-info">{username}</p>
      </div>
  
      <div className="status-actions">
        {inProgressMessage && <p>{inProgressMessage}</p>}
        
        <p className={connectedPlayerCount === 2 ? 'connected-green' : ''}>
          {connectedPlayerCount}/2 players connected
        </p>
  
        {startingMessage ? (
          <p>{startingMessage}</p>
        ) : isConnected ? (
          <button 
            onClick={handleStartGame} 
            disabled={buttonPressed || connectedPlayerCount < 2} 
            className={buttonPressed ? 'button-pressed' : ''}
          >
            Start Game
          </button>
        ) : (
          <p>Connecting...</p>
        )}
  
        <button type="button" onClick={handleCustomize}>Customize</button>
      </div>

      {/* Theme selection */}
      <div className="theme-selector">
        <label>Select Theme:</label>
        <select value={theme} onChange={handleThemeChange}>
          <option value="autumn">Autumn</option>
          <option value="summer">Summer</option>
          <option value="spring">Spring</option>
        </select>
      </div>
  
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Customize Your Character</h2>
            <input
              type="text"
              placeholder="Enter username"
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              className="enter-info"
            />
  
            <div className="arrow-container">
              <button className="arrow left-arrow" onClick={() => handleArrowClick('left')}>&lt;</button>
              <img src={imageMap[profilePictureId].base} alt={`Option ${profilePictureId}`} className="option-img" />
              <button className="arrow right-arrow" onClick={() => handleArrowClick('right')}>&gt;</button>
            </div>
  
            <div className="modal-actions">
              <button onClick={handleSaveGameState}>Save</button>
              <button onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
