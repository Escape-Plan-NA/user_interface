import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../context/WebSocketProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Lobby = () => {
  const { socket, isConnected } = useWebSocket();
  const navigate = useNavigate();
  const [players, setPlayers] = useState({ farmer: false, thief: false });
  const [role, setRole] = useState(null);
  const [gameStarted, setGameStarted] = useState(false); // Track if game should start
  const [inProgressMessage, setInProgressMessage] = useState('');

  useEffect(() => {
    if (role) {
      console.log("Role is set in Lobby:", role);
    }
  }, [role]);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const socketID = socket.id;  // Retrieve the current socket ID
        const response = await axios.get(`http://127.0.0.1:3000/api/get-role/${socketID}`);
        const assignedRole = response.data.role;
        console.log("Assigned role from API:", assignedRole);
        setRole(assignedRole);
      } catch (error) {
        console.error("Error fetching role:", error.response?.data || error.message);
      }
    };

    if (socket && socket.id) {
      fetchRole();
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    console.log("Lobby component mounted. Socket is available:", socket);
    console.log("Connection status:", isConnected);

    socket.once('playerConnected', ({ role: assignedRole }) => {
      console.log("Received playerConnected event with role:", assignedRole);
      //setRole(assignedRole);
      setPlayers((prev) => ({ ...prev, [assignedRole]: true }));
    });

    // Emit joinLobby event to the server
    socket.emit('joinLobby');
    console.log("Emitted 'joinLobby' event to the server.");

    // Listen for player status updates
    socket.on('currentPlayerStatus', ({ players: updatedPlayers }) => {
      console.log("Received 'currentPlayerStatus' update:", updatedPlayers);
      setPlayers({
        farmer: updatedPlayers[0].connected,
        thief: updatedPlayers[1].connected,
      });
    });

    // Listen for game start event
    socket.on('gameStarted', () => {
      console.log("Both players are ready. Game is starting...");
      setGameStarted(true); // Set gameStarted to true
    });

    // Listen for disconnection events
    socket.on('playerDisconnected', ({ role: disconnectedRole }) => {
      console.log(`Received 'playerDisconnected' event for role: ${disconnectedRole}`);
      setPlayers((prev) => ({ ...prev, [disconnectedRole]: false }));
    });

    // Listen for game-in-progress messages if lobby is full
    socket.on('gameInProgress', ({ message }) => {
      console.log("Received 'gameInProgress' message from server.");
      setInProgressMessage(message);
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
      socket.off('playerDisconnected');
      socket.off('gameInProgress');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      console.log("Lobby component unmounted, listeners removed.");
    };
  }, [socket, isConnected]);

  // UseEffect to trigger navigation only when `gameStarted` is true and `role` is available
  useEffect(() => {
    if (gameStarted && role) {
      console.log("Navigating to game with role:", role);
      navigate('/game', { state: { role } });
    }
  }, [gameStarted, role, navigate]);

  const handleStartGame = () => {
    console.log("Start Game button clicked");
    if (!role) {
      console.error("No role assigned yet. Cannot start the game.");
      return;
    }
    socket.emit('playerReady');
    console.log(`Emitted 'playerReady' event for role: ${role}`);
  };

  return (
    <div>
      <h2>Game Lobby</h2>
      {inProgressMessage && <p>{inProgressMessage}</p>}
      <div>
        <p>Farmer: {players.farmer ? "Connected" : "Waiting"}</p>
        <p>Thief: {players.thief ? "Connected" : "Waiting"}</p>
      </div>
      {isConnected ? (
        <button onClick={handleStartGame}>
          Start Game
        </button>
      ) : (
        <p>Connecting...</p>
      )}
    </div>
  );
};

export default Lobby;
