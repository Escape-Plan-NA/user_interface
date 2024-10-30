import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../context/WebSocketProvider';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
  const { socket, isConnected } = useWebSocket();
  const navigate = useNavigate();
  const [players, setPlayers] = useState({ farmer: false, thief: false });
  const [role, setRole] = useState(null);
  const [inProgressMessage, setInProgressMessage] = useState('');


  useEffect(() => {
    // Forcing a temporary role assignment for testing
    setRole("farmer"); // or setRole("thief")
    setPlayers((prev) => ({ ...prev, ["farmer"]: true })); // Replace with "thief" if needed
    console.log("Temporary role set for testing purposes");
  }, []);

  useEffect(() => {
    if (!socket) return;

    console.log("Lobby component mounted. Socket is available:", socket);
    console.log("Connection status:", isConnected);

    // Emit joinLobby event to the server
    socket.emit('joinLobby');
    console.log("Emitted 'joinLobby' event to the server.");

    // Listen for the assigned role from the server
    socket.on('playerConnected', ({ role: assignedRole }) => {
      if (!role) {
        console.log(`Setting role to ${assignedRole}`);
        setRole(assignedRole); // Store the assigned role for this client
        setPlayers((prev) => ({ ...prev, [assignedRole]: true }));
      } else {
        console.warn("Attempted to reassign role:", assignedRole, "Existing role:", role);
      }
      console.log("Current client role after assignment:", assignedRole);
      console.log("Players state:", { ...players });
    });

    // Listen for player status updates
    socket.on('currentPlayerStatus', ({ players: updatedPlayers }) => {
      console.log("Received 'currentPlayerStatus' update:", updatedPlayers);
      setPlayers({
        farmer: updatedPlayers[0].connected,
        thief: updatedPlayers[1].connected,
      });
      console.log("Updated players state:", { farmer: updatedPlayers[0].connected, thief: updatedPlayers[1].connected });
    });

    // Listen for game start event
    socket.on('gameStarted', () => {
      console.log("Both players are ready. Game is starting...");
      navigate('/game');
    });

    // Listen for disconnection events
    socket.on('playerDisconnected', ({ role: disconnectedRole }) => {
      console.log(`Received 'playerDisconnected' event for role: ${disconnectedRole}`);
      setPlayers((prev) => ({ ...prev, [disconnectedRole]: false }));
      console.log("Updated players state after 'playerDisconnected':", { ...players });
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

  const handleStartGame = () => {
    console.log("Start Game button clicked");  // Add this line
    if (!role) {
      console.error("No role assigned yet. Cannot start the game.");
      return;
    }
    console.log("Current players state:", players);
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
