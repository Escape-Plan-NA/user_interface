// Game.jsx
// Game.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../../context/WebSocketProvider';
import GameHeader from '../../components/GameHeader/GameHeader.jsx';
import GameBoard from '../../components/GameBoard/GameBoard.jsx';
import Scoreboard from '../../components/Scoreboard/Scoreboard.jsx';

const Game = () => {

  // Get the role passed from the previous page via location state
  const location = useLocation(); //role passed from lobby
  const { socket } = useWebSocket();
  const name =useLocation(); //username passed from lobby

  // Define the initial game state variables
  const [grid, setGrid] = useState([]);
  const [thiefPosition, setThiefPosition] = useState({ row: 1, col: 1 });
  const [farmerPosition, setFarmerPosition] = useState({ row: 1, col: 1 });
  const [turn, setTurn] = useState("");
  const [scores, setScores] = useState({ farmer: 0, thief: 0 });
  const [role, setRole] = useState(location.state?.role || null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const thiefImage = "path/to/thief-image.png"; // Replace with your image path
  const [username, setUsername] = useState(name.state?.username || "Guest"); // Set default if not provided
  const [logs, setLogs] = useState([]);


  // Initial setup and event listeners for receiving game data from the server
  useEffect(() => {
    // Listen for move logs from the server
    socket.on("moveLog", (message) => {
      setLogs((prevLogs) => [...prevLogs, message]);
    });

    // Cleanup event listener on component unmount
    return () => {
      socket.off("moveLog");
    };
  }, []);
  useEffect(() => {
    console.log(role);
    if (!socket) return;

    // Listen for game state updates from the server
    socket.on("gameState", (gameData) => {
      console.log("Game State Update:", gameData);
      setGrid(gameData.grid.blocks || []);
      setThiefPosition(gameData.grid.thiefPosition);
      setFarmerPosition(gameData.grid.farmerPosition);
      setTurn(gameData.currentTurn);
      setScores({
        farmer: gameData.players[0].score,
        thief: gameData.players[1].score,
      });
    });

    // Listen for timer updates from the server
    socket.on("timerUpdate", ({ timeLeft, turnTimeLeft }) => {
      setTimeLeft(timeLeft);
      setTurnTimeLeft(turnTimeLeft);
    });

    // Listen for the end of game, announcing the winner
    socket.on("winner", ({ winner, scores }) => {
      alert(`${winner === 'farmer' ? "Farmer catches the thief!" : "Thief reaches the tunnel!"} ${winner} wins!\nCurrent Scores:\nFarmer: ${scores.farmer}, Thief: ${scores.thief}`);
      setScores(scores);
    });
// Request game reset when component mounts
    socket.emit("resetGame");
 // Cleanup listeners on component unmount
    return () => {
      socket.off("roleAssigned");
      socket.off("gameState");
      socket.off("timerUpdate");
      socket.off("winner");
    };
  }, [socket]);

  const handleKeyPress = (e) => {
    console.log(`Client role: ${role}, current turn: ${turn}`);

    if (turn !== role) {
      console.log("Not your turn");
      return;
    }

    let newPosition = role === "farmer" ? { ...farmerPosition } : { ...thiefPosition };
    console.log("Key pressed:", e.key);

    switch (e.key) {
      case "ArrowUp":
        newPosition.row -= 1;
        break;
      case "ArrowDown":
        newPosition.row += 1;
        break;
      case "ArrowLeft":
        newPosition.col -= 1;
        break;
      case "ArrowRight":
        newPosition.col += 1;
        break;
      default:
        return;
    }

    if (
      newPosition.row < 0 ||
      newPosition.row >= grid.length ||
      newPosition.col < 0 ||
      newPosition.col >= grid[0].length
    ) {
      console.log("Invalid move: outside the grid boundaries.");
      return;
    }

    socket.emit("move", { role, newPosition });
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [turn, role, farmerPosition, thiefPosition, grid]);

  const resetGame = () => {
    socket.emit("resetGame");
    console.log("Requested a full game reset with scores reset");
  };

  return (
    <div>
      <GameHeader  role={role} timeLeft={timeLeft} turn={turn} turnTimeLeft={turnTimeLeft} username={username} />
      <GameBoard
        grid={grid}
        farmerPosition={farmerPosition}
        thiefPosition={thiefPosition}
        thiefImage={thiefImage}
      />
      <Scoreboard farmerScore={scores.farmer} thiefScore={scores.thief} />
      <button onClick={resetGame}>Full Reset</button>
      <h3>Move Logs</h3>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default Game;