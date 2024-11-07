import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../context/WebSocketProvider';
import SpringMenu from '../../assets/Menu/SpringMenu.gif';
import SummerMenu from '../../assets/Menu/SummerMenu.gif';
import AutumnMenu from '../../assets/Menu/AutumnMenu.gif';
import './Menu.css';

const Menu = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useWebSocket();
  const [connectedClientCount, setConnectedClientCount] = useState(0);

  const backgroundImages = [SpringMenu, SummerMenu, AutumnMenu];
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  useEffect(() => {
    if (!isConnected) return;

    socket.emit('clientConnected');

    const handleConnectedClients = (count) => {
      setConnectedClientCount(count);
    };

    socket.on('totalConnectedClients', handleConnectedClients);

    return () => {
      socket.off('totalConnectedClients', handleConnectedClients);
    };
  }, [isConnected, socket]);

  useEffect(() => {
    console.log("Initial Background Image URL:", backgroundImages[backgroundIndex]);

    const interval = setInterval(() => {
      setBackgroundIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % backgroundImages.length;
        console.log("Switching to Background Image URL:", backgroundImages[newIndex]);
        return newIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div
      className="menu-container"
      style={{ backgroundImage: `url(${backgroundImages[backgroundIndex]})` }}
    >
      <div className="content-wrapper">
        <button id="start-button" onClick={() => navigate('/lobby')}>Multiplayer</button>
        <button id="start-button" onClick={() => navigate('/singledevice')}>Singleplayer</button> 
        <button id="settings" onClick={() => navigate('/setting')}>Settings</button>
        <div className="connected-clients">
          <p>Connected Clients: {connectedClientCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
