// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketProvider';
import Lobby from './pages/Lobby/Lobby.jsx';
import Game from './pages/Game/Game.jsx';
import Menu from "./pages/MainMenu/Menu.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Setting from "./pages/Settings/Settings.jsx";
import GamePlay from "./pages/GamePlay/Gameplay.jsx";
import SingleGameplay from "./pages/GamePlay/SingleGameplay.jsx";
import BotGameplay from "./pages/GamePlay/BotGameplay.jsx";
import Cutscene from "./pages/CutScene/Cutscene.jsx";
import SingleCutscene from "./pages/CutScene/SingleplayerCutscene.jsx";
import SingleplayerModeSelection from "./pages/Selection/SingleplayerModeSelection.jsx"; // Import the new page

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
