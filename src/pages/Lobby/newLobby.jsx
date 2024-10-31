import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../context/WebSocketProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Lobby = () => {
  const { socket, isConnected } = useWebSocket();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState(''); // Single state for user-provided name
  const [playerName, setPlayerName] = useState('Guest');
  const [profilePicture, setProfilePicture] = useState('src/assets/Character/White/White.gif');
  const [selectedProfilePicture, setSelectedProfilePicture] = useState('src/assets/Character/White/White.gif');
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasJoinedLobby = useRef(false);
  const [role, setRole] = useState(null);
  const [players, setPlayers] = useState({ farmer: false, thief: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [inProgressMessage, setInProgressMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageOptions = [
    "src/assets/Character/White/White.gif",
    "src/assets/Character/Blue/Blue.gif",
    "src/assets/Character/Cream/Cream.gif",
    "src/assets/Character/DarkGreen/Dark Green.gif",
    "src/assets/Character/Green/Green.gif",
    "src/assets/Character/Pink/Pink.gif",
    "src/assets/Character/Purple/Purple.gif",
    "src/assets/Character/Red/Red.gif",
    "src/assets/Character/Yellow/Yellow.gif"
  ];

  useEffect(() => {
    const fetchRole = async () => {
      if (socket?.id) {
        try {
          const response = await axios.get(`http://127.0.0.1:3000/api/get-role/${socket.id}`);
          const assignedRole = response.data.role;
          setRole(assignedRole);
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
    socket.once('playerConnected', ({ role: assignedRole }) => {
      setPlayers((prev) => ({ ...prev, [assignedRole]: true }));
    });

    socket.on('currentPlayerStatus', ({ players: updatedPlayers }) => {
      setPlayers({
        farmer: updatedPlayers[0].connected,
        thief: updatedPlayers[1].connected,
      });
    });

    socket.on('gameStarted', () => setGameStarted(true));
    socket.on('gameInProgress', ({ message }) => setInProgressMessage(message));
    socket.on('playerDisconnected', ({ role: disconnectedRole }) => {
      setPlayers((prev) => ({ ...prev, [disconnectedRole]: false }));
    });

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      socket.off('playerConnected');
      socket.off('currentPlayerStatus');
      socket.off('gameStarted');
      socket.off('gameInProgress');
      socket.off('playerDisconnected');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    if (gameStarted && role) {
      navigate('/game', { state: { username, role } });
    }
  }, [gameStarted, role, navigate]);

  const handleCustomize = (e) => {
    e.preventDefault();
    const finalPlayerName = playerName || "Guest"; // Use "Guest" if playerName is empty
    setPlayerName(finalPlayerName);
    setSelectedProfilePicture(profilePicture); // Set the initial profile picture in the modal
    setIsModalOpen(true); // Open customization modal
  };

  const handleArrowClick = (direction) => {
    setCurrentIndex((prevIndex) => {
      const newIndex = direction === 'left'
        ? (prevIndex === 0 ? imageOptions.length - 1 : prevIndex - 1)
        : (prevIndex === imageOptions.length - 1 ? 0 : prevIndex + 1);
      
      setSelectedProfilePicture(imageOptions[newIndex]);  // Update the temporary profile picture with the new index
      return newIndex;
    });
  };

  const handleStartGame = () => {
    console.log("Start Game button clicked");
    // Check if username is entered
  if (!username.trim()) {
    console.error("No username provided. Please enter a username.");
    alert("Please enter a username.");
    return;
  }
  
    if (!role) {
      console.error("No role assigned yet. Cannot start the game.");
      return;
    }
    socket.emit('playerReady', {userId: socket.id, username});
    console.log(`Emitted 'playerReady' event for ${username} role: ${role}`);
  }

  const handleSaveGameState = () => {
    setProfilePicture(selectedProfilePicture);  // Update profile picture in state only when the user clicks 'Save'
    setPlayerName(playerName || "Guest");

    // Close the modal after saving
    setIsModalOpen(false);
  };

  return (
    <div>
      <h2>Game Lobby</h2>
      <img src = {profilePicture}/>
      {inProgressMessage && <p>{inProgressMessage}</p>}

      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <p>Farmer: {players.farmer ? "Connected" : "Waiting"}</p>
      <p>Thief: {players.thief ? "Connected" : "Waiting"}</p>

      {isConnected ? (
        <button onClick={handleStartGame}>Start Game</button>
      ) : (
        <p>Connecting...</p>
      )}

      <button type="button" onClick={handleCustomize}>Customize</button>


      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Customize Your Character</h2>
            <p>Player: {playerName}</p>
            <div className="arrow-container">
              <button className="arrow left-arrow" onClick={() => handleArrowClick('left')}>&lt;</button>
              <img src={imageOptions[currentIndex]} alt={`Option ${currentIndex + 1}`} className="option-img" />
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