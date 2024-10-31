import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import './Cutscene.css';

const Cutscene = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, username } = location.state || {};
  const [gameData, setGameData] = useState(null);

  // Fetch game data on component mount
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/gameData');
        const data = await response.json();
        setGameData(data); // Store the fetched game data
        console.log("Fetched gameData:", data); // For debugging purposes
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    fetchGameData();
  }, []);

  // Navigate to game after a delay, passing gameData along with role and username
  useEffect(() => {
    if (gameData) { // Ensure gameData is loaded before navigating
      const timer = setTimeout(() => {
        console.log("Navigating with data:", { role, username, gameData }); // Log state before navigating
        navigate('/game', { state: { role, username, gameData } });
      }, 16000);

      return () => clearTimeout(timer);
    }
  }, [navigate, role, username, gameData]);

  return (
    <div className="cutscene-container">
    </div>
  );
};

export default Cutscene;
