// Game.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../../context/WebSocketProvider';
import GameHeader from '../../components/GameHeader/GameHeader.jsx';
import GameBoard from '../../components/GameBoard/GameBoard.jsx';
import Scoreboard from '../../components/Scoreboard/Scoreboard.jsx';
import Chat from '../../components/Chat/Chat.jsx';
import farmer from '../../assets/Character/White/White(T).gif';
import thief from '../../assets/Character/White/White(Th).gif';

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
  const thiefImage = thief;
  const farmerImage = farmer;
  const [scores, setScores] = useState({ farmer: 0, thief: 0 });
  const [role, setRole] = useState(location.state?.role || null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [username, setUsername] = useState(name.state?.username || "Guest"); // Set default if not provided
  const [logs, setLogs] = useState([]);

  // Initial setup and event listeners for receiving game data from the server
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
  
    let direction = "";
  
    switch (e.key) {
      case "ArrowUp":
        direction = "up";
        break;
      case "ArrowDown":
        direction = "down";
        break;
      case "ArrowLeft":
        direction = "left";
        break;
      case "ArrowRight":
        direction = "right";
        break;
      default:
        return; // Ignore any non-arrow key presses
    }
  
    console.log(`Move direction: ${direction}`);
    socket.emit("move", { role, direction });
  };
  
  // Attach event listener to handle arrow key press
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [turn, role]);
  

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [turn, role, farmerPosition, thiefPosition, grid]);

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

  const resetGame = () => {
    socket.emit("resetGame");
    console.log("Requested a full game reset with scores reset");
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
          turnTimeLeft={turnTimeLeft} />
        
        <Chat username={username}></Chat>
        
        <div className="gameboard-container">
          <GameBoard
            grid={grid}
            farmerPosition={farmerPosition}
            thiefPosition={thiefPosition}
            thiefImage={thiefImage}
            farmerImage={farmerImage}
            farmerName="Kiak"  // Replace with the actual farmer name
            thiefName="Guest" // Replace with the actual thief name
          />
          <Scoreboard 
            farmerScore={scores.farmer} 
            thiefScore={scores.thief} 
            farmerName="Kiak"  // Replace with the actual farmer name
            thiefName="Guest"
          />
          
          {/* New container for logs and reset button */}
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
