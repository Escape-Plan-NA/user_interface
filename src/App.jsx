// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketProvider';
import Lobby from './pages/Lobby/Lobby.jsx';
import Game from './pages/Game/Game.jsx';

const App = () => (
  <WebSocketProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  </WebSocketProvider>
);

export default App;
