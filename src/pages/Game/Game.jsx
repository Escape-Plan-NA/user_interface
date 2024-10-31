import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../../context/WebSocketProvider';
import GameHeader from '../../components/GameHeader/GameHeader.jsx';
import GameBoard from '../../components/GameBoard/GameBoard.jsx';
import Scoreboard from '../../components/Scoreboard/Scoreboard.jsx';
import { SoundEffectContext } from "../../context/SoundEffectContext.jsx";
import { imageMap } from '../../utils/imageMap';
import './Game.css';
import Chat from '../../components/Chat/Chat.jsx';

const Game = () => {
  const location = useLocation();
  const { socket } = useWebSocket();
  const { role, username, gameData } = location.state || { gameData: { players: [] } };

  // Log gameData to confirm reception
  useEffect(() => {
    console.log("Received gameData in Game.jsx:", gameData);
  }, [gameData]);

  // Access farmer and thief data with fallback
  const farmer = gameData?.players?.find(player => player.role === 'farmer') || {};
  const thief = gameData?.players?.find(player => player.role === 'thief') || {};

  const farmerName = farmer.username || "Farmer";
  const thiefName = thief.username || "Thief";
  const farmerImage = farmer.image_id ? imageMap[farmer.image_id]?.farmer : "/assets/characters/default_farmer.gif";
  const thiefImage = thief.image_id ? imageMap[thief.image_id]?.thief : "/assets/characters/default_thief.gif";

  // Define the initial game state variables
  const [grid, setGrid] = useState([]);
  const [thiefPosition, setThiefPosition] = useState({ row: 1, col: 1 });
  const [farmerPosition, setFarmerPosition] = useState({ row: 1, col: 1 });
  const [turn, setTurn] = useState("");
  const [scores, setScores] = useState({ farmer: 0, thief: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [logs, setLogs] = useState([]);

  const { soundEffectsEnabled } = useContext(SoundEffectContext);
  
  const sounds = useRef({
    farmerMove: new Audio("/soundEffects/farmer_move.mp3"),
    thiefMove: new Audio("/soundEffects/thief_move.mp3"),
    farmerWin: new Audio("/soundEffects/farmer_win.mp3"),
    thiefWin: new Audio("/soundEffects/thief_win.mp3"),
    tieGame: new Audio("/soundEffects/tieGame.mp3")
  });

  useEffect(() => {
    if (soundEffectsEnabled) {
      Object.values(sounds.current).forEach(sound => sound.load());
    }
  }, [soundEffectsEnabled]);

  const playSound = (sound) => {
    if (soundEffectsEnabled && sound) {
      sound.play().catch(error => console.error("Error playing sound:", error));
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("gameState", (gameData) => {
      setGrid(gameData.grid.blocks || []);
      setThiefPosition(gameData.grid.thiefPosition);
      setFarmerPosition(gameData.grid.farmerPosition);
      setTurn(gameData.currentTurn);
      setScores({
        farmer: gameData.players[0].score,
        thief: gameData.players[1].score,
      });
    });

    socket.on("timerUpdate", ({ timeLeft, turnTimeLeft }) => {
      setTimeLeft(timeLeft);
      setTurnTimeLeft(turnTimeLeft);
    });

    socket.on("winner", ({ winner, scores }) => {
      setScores(scores);
      playSound(winner === "farmer" ? sounds.current.farmerWin : sounds.current.thiefWin);
      alert(`${winner === "farmer" ? "Farmer" : "Thief"} wins!\nCurrent Scores:\nFarmer: ${scores.farmer}, Thief: ${scores.thief}`);
    });

    socket.emit("resetGame");

    return () => {
      socket.off("gameState");
      socket.off("timerUpdate");
      socket.off("winner");
    };
  }, [socket]);

  const handleKeyPress = (e) => {
    if (turn !== role) return;

    let direction = "";
    switch (e.key) {
      case "ArrowUp": direction = "up"; break;
      case "ArrowDown": direction = "down"; break;
      case "ArrowLeft": direction = "left"; break;
      case "ArrowRight": direction = "right"; break;
      default: return;
    }

    socket.emit("move", { role, direction });
    playSound(role === "farmer" ? sounds.current.farmerMove : sounds.current.thiefMove);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [turn, role]);

  useEffect(() => {
    socket.on("moveLog", (message) => {
      setLogs((prevLogs) => {
        const updatedLogs = [...prevLogs, message];
        return updatedLogs.slice(-4); // Keep only the last 4 entries
      });
    });
  
    // Cleanup event listener on component unmount
    return () => {
      socket.off("moveLog");
    };
  }, [socket]);

  const resetGame = () => {
    socket.emit("resetGame");
  };

  return (
    <div className="container">
      <div className="background-front"></div> 
  
      <div className="player-name-display">
        <p>Player: {username || "Guest"}</p>
        
        <GameHeader 
          role={role} 
          timeLeft={timeLeft} 
          turn={turn} 
          turnTimeLeft={turnTimeLeft}
          username={username}
        />
        
        <Chat username={username} />
        
        <div className="gameboard-container">
          <GameBoard
            grid={grid}
            farmerPosition={farmerPosition}
            thiefPosition={thiefPosition}
            farmerImage={farmerImage}
            thiefImage={thiefImage}
            farmerName={farmerName}
            thiefName={thiefName}
          />
          <Scoreboard 
            farmerScore={scores.farmer} 
            thiefScore={scores.thief} 
            farmerName={farmerName}
            thiefName={thiefName}
          />
          
          <div className="bottom-controls">
            <h3>Move Logs</h3>
            <ul className="move-logs">
              {logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
            <button className="reset-button" onClick={resetGame}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
