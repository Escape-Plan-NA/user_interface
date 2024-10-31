// Menu.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../context/WebSocketProvider';
import './Menu.css';

const Menu = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useWebSocket(); // Access socket and connection status
  const [connectedClientCount, setConnectedClientCount] = useState(0); // Local state for client count

  useEffect(() => {
    if (!isConnected) return; // Ensure the socket is connected

    const handleConnectedClients = (count) => {
      setConnectedClientCount(count); // Update client count when received
    };

    // Listen for 'totalConnectedClients' event
    socket.on('totalConnectedClients', handleConnectedClients);

    // Cleanup the event listener on unmount
    return () => {
      socket.off('totalConnectedClients', handleConnectedClients);
    };
  }, [isConnected, socket]);

  return (
    <div className="menu-container">
      <h1>ESCAPE PLAN</h1>
      <button id="start-button" onClick={() => navigate('/lobby')}>Multiplayer</button>
      <button id="start-button" onClick={() => navigate('/singledevice')}>Singleplayer</button> 
      <button id="settings" onClick={() => navigate('/setting')}>Settings</button>
      <div className="connected-clients">
        <p>Connected Clients: {connectedClientCount}</p>
      </div>
    </div>
  );
};

export default Menu;
