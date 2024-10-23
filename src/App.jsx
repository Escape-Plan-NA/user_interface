import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import Menu from "./pages/MainMenu/Menu.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Setting from "./pages/Settings/Settings.jsx";
import GamePlay from "./pages/GamePlay/Gameplay.jsx";
import SingleGameplay from "./pages/GamePlay/SingleGamePlay.jsx";
import BotGameplay from "./pages/GamePlay/BotGameplay.jsx";
import Cutscene from "./pages/CutScene/Cutscene.jsx";
import SingleCutscene from "./pages/CutScene/SingleplayerCutscene.jsx";
import Lobby from "./pages/Lobby/Lobby.jsx";
import SingleplayerModeSelection from "./pages/Selection/SingleplayerModeSelection.jsx"; 
import { FaArrowLeft } from 'react-icons/fa'; 

// Create a global layout to manage the back button
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to go back to the previous page
  const handleBack = () => {
    navigate(-1); // Navigate to the previous route
  };

  // Don't show the Back button on the home (Menu) page
  const shouldShowBackButton = location.pathname !== "/";

  return (
    <div>
      {/* Conditionally render the Back button */}
      {shouldShowBackButton && (
        <button onClick={handleBack} style={{ position: "fixed", top: 10, left: 10 }}>
          <FaArrowLeft />
        </button>
      )}

      {/* Render the page content */}
      <div>{children}</div>
    </div>
  );
};

const buttonStyle = {
  position: "fixed",
  top: 10,
  left: 10,
  background: "transparent",
  border: "none",
  fontSize: "24px",
  cursor: "pointer"
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
