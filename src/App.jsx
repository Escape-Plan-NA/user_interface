import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Menu from "./pages/MainMenu/Menu.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Setting from "./pages/Settings/Settings.jsx";
import GamePlay from "./pages/GamePlay/Gameplay.jsx";
import SingleGameplay from "./pages/GamePlay/SingleGamePlay.jsx";
import BotGameplay from "./pages/GamePlay/BotGameplay.jsx";
import Cutscene from "./pages/CutScene/Cutscene.jsx";
import SingleCutscene from "./pages/CutScene/SingleplayerCutscene.jsx";
import Lobby from "./pages/Lobby/Lobby.jsx";
import SingleplayerModeSelection from "./pages/Selection/SingleplayerModeSelection.jsx"; // Import the new page

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for the Menu page */}
        <Route path="/" element={<Menu />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/singledevice" element={<SingleplayerModeSelection />} />
        <Route path="/friends" element={<SingleGameplay />} />
        <Route path="/bot" element={<BotGameplay />} />
        <Route path="/singlecutscene" element={<SingleCutscene />} />
        <Route path="/cutscene" element={<Cutscene />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/start" element={<GamePlay />} />
        
        {/* Redirect all other undefined routes to the Menu page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
