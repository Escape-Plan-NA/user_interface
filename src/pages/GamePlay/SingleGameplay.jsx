// src/pages/GamePlay/SingleGameplay.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Scoreboard from '../../components/Scoreboard/SingleScoreboard.jsx';
import WinModal from '../../components/WinModal/WinModal.jsx'; // Import the WinModal
import './GamePlay.css';

const SingleGameplay = () => {
  const { role } = useParams(); // 'farmer' or 'thief'
  const [timeLeft, setTimeLeft] = useState(180);
  const [grid, setGrid] = useState([]);
  const [farmerPosition, setFarmerPosition] = useState(null);
  const [thiefPosition, setThiefPosition] = useState(null);
  const [turn, setTurn] = useState("thief"); // Initial turn: thief
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [scores, setScores] = useState({ farmer: 0, thief: 0 });
  const [gameEnded, setGameEnded] = useState(false);
  const [lastWinner, setLastWinner] = useState("thief"); // Track the last winner
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const [modalMessage, setModalMessage] = useState(""); // Message for the modal
  const navigate = useNavigate();

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
    setShowModal(false); // Ensure the modal is hidden when starting a new game
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
      let currentPosition = turn === "farmer" ? { ...farmerPosition } : { ...thiefPosition };
      const setPosition = turn === "farmer" ? setFarmerPosition : setThiefPosition;

      let newPosition = { ...currentPosition };

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
        console.log("Invalid move: out of the grid boundaries.");
        return;
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
  }, [turn, farmerPosition, thiefPosition, grid]);

  // Check win conditions
const checkWinConditions = (currentPosition) => {
  if (turn === "thief") {
    // Thief loses if they move to the same block as the farmer
    if (currentPosition.row === farmerPosition.row && currentPosition.col === farmerPosition.col) {
      setThiefPosition({ row: currentPosition.row, col: currentPosition.col }); // Ensure the thief is updated in the same position
      setScores(prevScores => ({ ...prevScores, farmer: prevScores.farmer + 1 })); // Update scores for the farmer

      // Delay before showing modal and restarting the game
      setTimeout(() => {
        setMessageAndModal('Farmer catches the thief! Farmer wins!');
        setLastWinner("farmer"); // Farmer wins, starts next round
      }, 500); // 0.5s delay for modal

      // Add a delay before restarting the game to show both characters in the same cell
      setTimeout(() => {
        initializeGame("farmer"); // Restart the game with farmer starting
      }, 1000); // 1-second delay to allow rendering of both characters in the same grid
    }
    // Thief wins if they reach the tunnel block
    else if (grid[currentPosition.row][currentPosition.col] === 'tunnel') {
      setThiefPosition({ row: currentPosition.row, col: currentPosition.col });
      setScores(prevScores => ({ ...prevScores, thief: prevScores.thief + 1 })); // Update scores for the thief

      // Delay before showing modal and restarting the game
      setTimeout(() => {
        setMessageAndModal('Thief reaches the tunnel! Thief wins!');
        setLastWinner("thief"); // Thief wins, starts next round
      }, 500); // 0.5s delay for modal

      // Short delay to update UI before restarting
      setTimeout(() => {
        initializeGame("thief"); // Restart the game with thief starting
      }, 1000);
    }
  } else if (turn === "farmer") {
    // Farmer wins if they catch the thief
    if (currentPosition.row === thiefPosition.row && currentPosition.col === thiefPosition.col) {
      setFarmerPosition({ row: currentPosition.row, col: currentPosition.col }); // Ensure the farmer is updated in the same position
      setScores(prevScores => ({ ...prevScores, farmer: prevScores.farmer + 1 })); // Update scores for the farmer

      // Delay before showing modal and restarting the game
      setTimeout(() => {
        setMessageAndModal('Farmer catches the thief! Farmer wins!');
        setLastWinner("farmer"); // Farmer wins, starts next round
      }, 500); // 0.5s delay for modal

      // Add a delay before restarting the game to show both characters in the same cell
      setTimeout(() => {
        initializeGame("farmer"); // Restart the game with farmer starting
      }, 1000); // 1-second delay to allow rendering of both characters in the same grid
    }
  }
};


const setMessageAndModal = (message) => {
  setModalMessage(message);
  setShowModal(true); ///
};

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
return (
  <div className="gameplay-container">
    <h1>Gameplay Page</h1>
    <h2>Your role is: {role === "farmer" ? "👨‍🌾 Farmer (Warder)" : "🕵️‍♂️ Thief (Prisoner)"}</h2>
    <p
      className={`overall-timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}
    >
      Time left: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
    </p>
    <p>Turn: {turn === "farmer" ? "👨‍🌾 Farmer (Warder)" : "🕵️‍♂️ Thief (Prisoner)"}</p>
    <p>Turn time left: {turnTimeLeft} seconds</p>

    {/* Show the WinModal when a win happens */}
    {showModal && <WinModal message={modalMessage} role={lastWinner} scores={scores} onClose={() => setShowModal(false)} />}

    <table className="game-table">
      <tbody>
        {grid.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((block, colIndex) => (
              <td key={colIndex} className={`table-cell ${block}`}>
                {block === 'obstacle' && 'x'}
                {block === 'tunnel' && 't'}
                {farmerPosition?.row === rowIndex && farmerPosition?.col === colIndex &&
                  thiefPosition?.row === rowIndex && thiefPosition?.col === colIndex && (
                    <>
                      <span role="img" aria-label="farmer">👨‍🌾</span>
                      <span role="img" aria-label="thief">🕵️‍♂️</span>
                    </>
                )}
                {farmerPosition?.row === rowIndex && farmerPosition?.col === colIndex &&
                  !(thiefPosition?.row === rowIndex && thiefPosition?.col === colIndex) && (
                    <span role="img" aria-label="farmer">👨‍🌾</span>
                )}
                {thiefPosition?.row === rowIndex && thiefPosition?.col === colIndex &&
                  !(farmerPosition?.row === rowIndex && farmerPosition?.col === colIndex) && (
                    <span role="img" aria-label="thief">🕵️‍♂️</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

    <div className="scores">
      <h3>Scores</h3>
      <p>Farmer (Warder): {scores.farmer}</p>
      <p>Thief (Prisoner): {scores.thief}</p>
    </div>
  </div>
);

};

export default SingleGameplay;