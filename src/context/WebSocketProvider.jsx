// WebSocketProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const WebSocketContext = createContext(null);
let socket; // Declare socket as a global variable

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("Initializing WebSocket...");

    // Initialize socket if not already created
    socket = io("http://127.0.0.1:3000", {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error("Connection error:", error.message);
    });

    socket.on('reconnect_attempt', () => {
      console.log("Attempting to reconnect...");
    });

    socket.on('reconnect_failed', () => {
      console.error("Reconnection failed after 5 attempts");
    });

    // Disconnect socket and clear the reference on unmount
    return () => {
      if (socket) {
        console.log('Disconnecting WebSocket on unmount');
        socket.disconnect();
        socket = null; // Clear the socket reference to allow reinitialization
      }
    };
  }, []); // Empty dependency array to ensure this runs only once on mount

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
