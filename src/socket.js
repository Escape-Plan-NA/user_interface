// socket.js
import io from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_SERVER_URL}`, {
  reconnectionAttempts: 5,
  timeout: 10000,
});

// Event listeners for logging connection status
socket.on('connect', () => console.log('Connected to server'));
socket.on('disconnect', () => console.log('Disconnected from server'));
socket.on('connect_error', (error) => console.error("Connection error:", error.message));
socket.on('reconnect_attempt', () => console.log("Attempting to reconnect..."));
socket.on('reconnect_failed', () => console.error("Reconnection failed after 5 attempts"));

export default socket;
