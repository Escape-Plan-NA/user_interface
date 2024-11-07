import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import Scoreboard from '../../components/Scoreboard/SingleScoreboard.jsx';
import WinModal from '../../components/Modal/WinModal.jsx'; // Import the modal component
import { mapThemes } from '../../utils/mapThemes.js';
import { imageMap } from '../../utils/imageMap.js';

import './BotGameplay.css';


const BotGameplay = () => {
  const location = useLocation();
  const role = location.state?.role || 'thief'; // Default to 'thief' if role is not provided
  const [timeLeft, setTimeLeft] = useState(180);
  const [grid, setGrid] = useState([]);
  const [farmerPosition, setFarmerPosition] = useState(null);
  const [thiefPosition, setThiefPosition] = useState(null);
  const [turn, setTurn] = useState("thief"); // Initial turn: thief
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [scores, setScores] = useState({ farmer: 0, thief: 0 });
  const [gameEnded, setGameEnded] = useState(false);
  const [lastWinner, setLastWinner] = useState("thief"); // Track the last winner
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false); // State to toggle modal visibility
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState(mapThemes.autumn); // Set your default theme here

  //Back button
  const handleBackClick = () => {
    navigate('/')  // Goes back to the previous page
  };

  // Initialize the game grid and place characters
  const initializeGame = (startingPlayer) => {
    const size = 5;
    const totalBlocks = size * size;
    const obstacleCount = Math.floor(totalBlocks * 0.2); // 5 obstacle blocks
    const gridArray = Array(size).fill(null).map(() => Array(size).fill('free'));

    // Randomly place obstacles
    let obstaclesPlaced = 0;
    while (obstaclesPlaced < obstacleCount) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (gridArray[row][col] === 'free') {
        gridArray[row][col] = 'obstacle';
        obstaclesPlaced++;
      }
    }

    // Randomly place tunnel block
    let tunnelPlaced = false;
    while (!tunnelPlaced) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (gridArray[row][col] === 'free') {
        gridArray[row][col] = 'tunnel';
        tunnelPlaced = true;
      }
    }

    // Randomly place thief (prisoner)
    let thiefPos = null;
    while (!thiefPos) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (gridArray[row][col] === 'free') {
        thiefPos = { row, col };
      }
    }

    // Randomly place farmer (warder)
    let farmerPos = null;
    while (!farmerPos) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (gridArray[row][col] === 'free' && (row !== thiefPos.row || col !== thiefPos.col)) {
        farmerPos = { row, col };
      }
    }

    setGrid(gridArray);
    setThiefPosition(thiefPos);
    setFarmerPosition(farmerPos);
    setTurn(startingPlayer); // Set turn based on the last winner
    setGameEnded(false); // Reset gameEnded state
    setShowModal(false); // Ensure modal is hidden when the game starts
  };

  const resetGame = () => {
    setScores({ farmer: 0, thief: 0 }); // Reset scores to zero
    setTimeLeft(180);
    setTurnTimeLeft(10);
    initializeGame("thief"); // Start with the default starting player
  };

  useEffect(() => {
    initializeGame(lastWinner); // Start the game with the last winner
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setGameEnded(true); // End the game when the time is up
    }
  }, [timeLeft]);

  // Handle turn timer (10 seconds per turn)
  useEffect(() => {
    if (!gameEnded && turnTimeLeft > 0) {
      const timer = setInterval(() => {
        setTurnTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (!gameEnded) {
      switchTurns();
    }
  }, [turnTimeLeft, gameEnded]);

  const switchTurns = () => {
    setTurnTimeLeft(10);
    setTurn(turn === "farmer" ? "thief" : "farmer");
  };

  // Handle key press events for movement
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (turn !== role) return; // Only allow moves on player's turn

      let currentPosition = turn === "farmer" ? { ...farmerPosition } : { ...thiefPosition };
      const setPosition = turn === "farmer" ? setFarmerPosition : setThiefPosition;

      let newPosition = { ...currentPosition }; // Create a copy to calculate new position

      // Update the position based on key press
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
          return; // Exit if key is not an arrow key
      }

      // Check if the new position is outside the grid
      if (
        newPosition.row < 0 ||
        newPosition.row >= grid.length ||
        newPosition.col < 0 ||
        newPosition.col >= grid[0].length
      ) {
        console.log("Invalid move: out of the grid boundaries.");
        return; // Exit if the new position is invalid
      }

      const newBlock = grid[newPosition.row][newPosition.col];
      if (newBlock === "free" || (newBlock === "tunnel" && turn === "thief")) {
        setPosition(newPosition);
        checkWinConditions(newPosition);
        switchTurns();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [turn, role, farmerPosition, thiefPosition, grid]);

  // Check win conditions
  const checkWinConditions = (currentPosition) => {
    if (turn === "thief") {
      // Thief loses if they move to the same block as the farmer
      if (currentPosition.row === farmerPosition.row && currentPosition.col === farmerPosition.col) {
        setThiefPosition({ row: currentPosition.row, col: currentPosition.col });
        setMessage('Farmer catches the thief! Farmer wins!');
        setScores(prevScores => ({ ...prevScores, farmer: prevScores.farmer + 1 }));
        setLastWinner("farmer");

        // Show modal before restarting the game
        setTimeout(() => {
          setShowModal(true);
        }, 500);
      }
      // Thief wins if they reach the tunnel block
      else if (grid[currentPosition.row][currentPosition.col] === 'tunnel') {
        setThiefPosition({ row: currentPosition.row, col: currentPosition.col });
        setMessage('Thief reaches the tunnel! Thief wins!');
        setTimeout(() => {
          setScores(prevScores => ({ ...prevScores, thief: prevScores.thief + 1 }));
          setLastWinner("thief");
          setShowModal(true);
        }, 500);
      }
    } else if (turn === "farmer") {
      // Farmer wins if they catch the thief
      if (currentPosition.row === thiefPosition.row && currentPosition.col === thiefPosition.col) {
        setFarmerPosition({ row: currentPosition.row, col: currentPosition.col });
        setMessage('Farmer catches the thief! Farmer wins!');
        setScores(prevScores => ({ ...prevScores, farmer: prevScores.farmer + 1 }));
        setLastWinner("farmer");

        // Show modal before restarting the game
        setTimeout(() => {
          setShowModal(true);
        }, 500);
      }
    }
  };

  // Handle bot movement
  const handleBotMove = () => {
    let currentPosition = turn === "farmer" ? { ...farmerPosition } : { ...thiefPosition };
    const setPosition = turn === "farmer" ? setFarmerPosition : setThiefPosition;

    let validMoves = [];
    
    const possibleMoves = [
      { row: currentPosition.row - 1, col: currentPosition.col }, // Up
      { row: currentPosition.row + 1, col: currentPosition.col }, // Down
      { row: currentPosition.row, col: currentPosition.col - 1 }, // Left
      { row: currentPosition.row, col: currentPosition.col + 1 }  // Right
    ];

    // Filter valid moves (stay within grid and avoid obstacles)
    validMoves = possibleMoves.filter(move => {
      return (
        move.row >= 0 && move.row < grid.length &&
        move.col >= 0 && move.col < grid[0].length &&
        (grid[move.row][move.col] === 'free' || (grid[move.row][move.col] === 'tunnel' && turn === "thief"))
      );
    });

    if (validMoves.length > 0) {
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      setPosition(randomMove);
      checkWinConditions(randomMove);
      switchTurns();
    }
  };

  // Trigger bot move when it's the bot's turn
  useEffect(() => {
    if (turn !== role && !gameEnded) {
      const botMoveTimeout = setTimeout(() => {
        handleBotMove(); // Bot makes a move after 2 seconds
      }, 2000);
  
      return () => clearTimeout(botMoveTimeout);
    }
  }, [turn, role, gameEnded]);

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false); // Hide modal after 2 seconds
        initializeGame(lastWinner); // Restart the game with the next turn
      }, 2000); // Set a 2-second delay

      return () => clearTimeout(timer);
    }
  }, [showModal, lastWinner]);

  // Function to determine the winner based on scores
const getWinner = () => {
    if (scores.farmer > scores.thief) {
      return "Farmer wins!";
    } else if (scores.thief > scores.farmer) {
      return "Thief wins!";
    } else {
      return "It's a tie!";
    }
  };

  if (gameEnded) {
    return (
      <div className="game-over">
        <h2>{getWinner()}</h2>
        <Scoreboard 
          farmerScore={scores.farmer} 
          thiefScore={scores.thief} 
          onRetry={resetGame} // Use resetGame to reset everything
        />
      </div>
    );
  }
  
  return (<div
    className="container bg-autumn" // Dynamically change this to bg-autumn or another theme
    style={{
      backgroundImage: `url(${currentTheme.background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}
  >
    {/* Front Background Layer */}
    <div className="background-front bg-autumn"></div>

    <div className="gameboard-container">

    <div className="back-button-container">
        <button className="back-button" onClick={handleBackClick}>
          <img src="src/assets/buttons/quit.png"></img>
        </button>
      </div>

      {/* Game Header (keeping unchanged) */}
      <div className="game-header">
        <h2>Your role is: {role === "farmer" ? "👨‍🌾 Farmer" : "🕵️‍♂️ Thief "}</h2>
        <p className={`overall-timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
          Time left: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
        </p>
        <p>Turn: {turn === "farmer" ? "👨‍🌾 Farmer (Warder)" : "🕵️‍♂️ Thief (Prisoner)"}</p>
        <p>Turn time left: {turnTimeLeft} seconds</p>
      </div>

      {/* Game Grid/Table */}
      <table className="game-table">
        <tbody className="gameplay-body">
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((block, colIndex) => (
                <td key={colIndex} className="gameplay-cell" 
                style={{ backgroundImage: `url(${currentTheme[block]})`}}>
                  {block === 'obstacle' && <img src={currentTheme.obstacle} alt="Obstacle" />}
                  {block === 'tunnel' && <img src={currentTheme.tunnel} alt="Tunnel" />}
                  {block === 'free' && <img src={currentTheme.free1} alt="Free Space" />}

                  {/* Farmer Character with Name */}
                  {farmerPosition?.row === rowIndex && farmerPosition?.col === colIndex && (
                    <>
                      <div className="character-label">Farmer</div>
                      <img
                        src={imageMap.white.farmer}
                        alt="farmer"
                        className="character-image"
                      />
                    </>
                  )}

                  {/* Thief Character with Name */}
                  {thiefPosition?.row === rowIndex && thiefPosition?.col === colIndex && (
                    <>
                      <div className="character-label">Thief</div>
                      <img
                        src={imageMap.white.thief}
                        alt="thief"
                        className="character-image"
                      />
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Scoreboard (keeping unchanged) */}
      <div className="scoreboard-normal">
        <h3>Scores</h3>
        <div className="scoreboard-item">
          <span> Farmer: </span>
          <span className="score-value"> {scores.farmer} </span>
        </div>

        <div className="scoreboard-item">
          <span> Thief:</span>
          <span className="score-value">{scores.thief}</span>
        </div>
      </div>
    </div>

    {/* Win Modal (if any) */}
    {showModal && (
        <WinModal
          message={message}
          role={turn}
          scores={scores}
        />
      )}
  </div>
  );
  
};

export default BotGameplay;
