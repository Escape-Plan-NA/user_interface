import React, { useEffect, useState, useRef, useContext } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GameHeader from '../../components/GameHeader/GameHeader.jsx';
import GameBoard from '../../components/GameBoard/GameBoard.jsx';
import Scoreboard from '../../components/Scoreboard/Scoreboard.jsx';
import { RoleContext } from '../../context/RoleContext.jsx';

const GamePlay = () => {
  const navigate = useNavigate();
  const { role, playerName, profilePicture } = useContext(RoleContext);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOverMessage, setGameOverMessage] = useState(null);
  const [grid, setGrid] = useState([]);
  const [farmerPosition, setFarmerPosition] = useState(null);
  const [thiefPosition, setThiefPosition] = useState(null);
  const [turn, setTurn] = useState(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [scores, setScores] = useState({ farmer: 0, thief: 0 });
  const [gameTimer, setGameTimer] = useState(60);
  const [turnTimer, setTurnTimer] = useState(10);
  const thiefImage = import.meta.env.VITE_THIEF_IMAGE;
  const isFirstRender = useRef(true);
  let gameWon = false;
  const [moveLogs, setMoveLogs] = useState([]); // Initialize moveLogs state

  useEffect(() => {
    console.log("Welcome to the game! The game has started.");
    startGame(); 

    return async () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
      } else {
        try {
          await axios.post(`${import.meta.env.VITE_SERVER_URL}/games/reset-game`);
          console.log("Exiting the game. Game state reset.");
        } catch (error) {
          console.error("Failed to reset game state on exit:", error);
        }
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_SERVER_URL}/games/reset-game`);
        console.log("Game state reset due to exit or page refresh.");
      } catch (error) {
        console.error("Failed to reset game state on exit or refresh:", error);
      }
    };
    

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  useEffect(() => {
    const fetchTimers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/games/game-state');
            const { gameTimer, currentTurn } = response.data;

            // Assume turnTimer counts down separately; reset when the turn changes
            setGameTimer(gameTimer);
            setTurnTimer(turnTimer);  // Adjust as needed
        } catch (error) {
            console.error('Error fetching timers:', error);
        }
    };

    // Set an interval to fetch the latest timers
    const interval = setInterval(fetchTimers, 1000);  // Fetch every second

    // Clean up on unmount
    return () => clearInterval(interval);
}, []);
useEffect(() => {
  if (turnTimer <= 0) {
      switchTurns(); // Call switch turns if time runs out
  }
}, [turnTimer]);

  const startGame = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/games/start`);
      const gameData = response.data.gameData;
      console.log(response.data);

      setGrid(gameData.grid.blocks || []);
      setThiefPosition(gameData.grid.thiefPosition);
      setFarmerPosition(gameData.grid.farmerPosition);
      setTurn(gameData.currentTurn);
    } catch (error) {
      console.error("Failed to start the game:", error);
    }
  };

  

  const switchTurns = async () => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/games/switch-turn`);
      const updatedGameState = response.data;

      setTurn(updatedGameState.currentTurn);

    } catch (error) {
      console.error("Error switching turn:", error);
    }
  };

  useEffect(() => {
    let moveInProgress = false;
    const handleKeyPress = async (e) => {
      if (moveInProgress) return; 
      moveInProgress = true;

      if (turn !== role) {
        console.log(`It's the ${turn}'s turn. You (${role}) cannot move.`);
        moveInProgress = false;
        return;
      }

      let currentPosition = role === "farmer" ? { ...farmerPosition } : { ...thiefPosition };
      let newPosition = { ...currentPosition };

      switch (e.key) {
        case "ArrowUp":
          if (newPosition.row > 0) newPosition.row -= 1;
          break;
        case "ArrowDown":
          if (newPosition.row < grid.length - 1) newPosition.row += 1;
          break;
        case "ArrowLeft":
          if (newPosition.col > 0) newPosition.col -= 1;
          break;
        case "ArrowRight":
          if (newPosition.col < grid[0].length - 1) newPosition.col += 1;
          break;
        default:
          moveInProgress = false;
          return;
      }

      if (newPosition.row === currentPosition.row && newPosition.col === currentPosition.col) {
        console.log("Invalid move: outside the grid boundaries.");
        moveInProgress = false;
        return; 
      }

      try {
        const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/games/move`, {
          role,
          newPosition
        });

        const updatedGameState = response.data;

        setGrid(updatedGameState.grid.blocks);
        setFarmerPosition(updatedGameState.grid.farmerPosition);
        setThiefPosition(updatedGameState.grid.thiefPosition);
        setTurn(updatedGameState.currentTurn);

        setTurnTimer(updatedGameState.turnTimer);

        checkWinConditions(newPosition);

      } catch (error) {
        console.error("Error processing move:", error.response ? error.response.data : error.message);
      } finally {
        moveInProgress = false;
      }
    };
    const fetchMoveLogs = async () => {
      try {
          const logResponse = await axios.get(`${import.meta.env.VITE_SERVER_URL}/games/move-log`);
          console.log("Move Logs:", logResponse.data); // Log or update your state with the fetched move logs
      } catch (error) {
          console.error("Error fetching move logs:", error.response ? error.response.data : error.message);
      }
  };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [turn, farmerPosition, thiefPosition, grid, role]);

  const checkWinConditions = async (currentPosition) => {
    if (gameWon) return;

    if (turn === "thief") {
      if (currentPosition.row === farmerPosition.row && currentPosition.col === farmerPosition.col) {
        gameWon = true;
        alert(`Farmer catches the thief! Farmer wins! \nCurrent Scores:\nFarmer: ${scores.farmer + 1}, Thief: ${scores.thief}`);
        await updateScore('farmer');
      } else if (grid[currentPosition.row][currentPosition.col] === 'tunnel') {
        gameWon = true;
        setThiefPosition(currentPosition);
        alert(`Thief reaches the tunnel! Thief wins! \nCurrent Scores:\nFarmer: ${scores.farmer}, Thief: ${scores.thief + 1}`);
        await updateScore('thief');
      }
    } else if (turn === "farmer") {
      if (currentPosition.row === thiefPosition.row && currentPosition.col === thiefPosition.col) {
        gameWon = true;
        alert(`Farmer catches the thief! Farmer wins! \nCurrent Scores:\nFarmer: ${scores.farmer + 1}, Thief: ${scores.thief}`);
        await updateScore('farmer');
      }
    }
  };

  const updateScore = async (winner) => {
    try {
      await axios.put(`${import.meta.env.VITE_SERVER_URL}/games/update-score`, { winner });
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/games/game-state`);

      setScores({
        farmer: response.data.players[0].score,
        thief: response.data.players[1].score,
      });

      setTurn(winner);
      await startGame(); 
      gameWon = false;
    } catch (error) {
      console.error(`Error updating score for ${winner}:`, error);
    }
  };

  const refreshGame = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/games/reset-game`);
      const resetGameData = response.data.gameData;

      setGrid(resetGameData.grid.blocks);
      setThiefPosition(resetGameData.grid.thiefPosition);
      setFarmerPosition(resetGameData.grid.farmerPosition);
      setTurn(resetGameData.currentTurn);

      setScores({
        farmer: resetGameData.players[0].score,
        thief: resetGameData.players[1].score,
      });

      setTimeLeft(60);
      setTurnTimeLeft(10);

    } catch (error) {
      console.error("Error refreshing game:", error);
    }
  };

  const handleGameOver = () => {
    let winner;
    if (scores.farmer > scores.thief) {
      winner = 'Farmer';
    } else if (scores.thief > scores.farmer) {
      winner = 'Thief';
    } else {
      winner = 'No one'; 
    }

    setGameOverMessage(`Game Over, ${winner} wins!!!\nFarmer: ${scores.farmer}, Thief: ${scores.thief}`);

    setTimeout(() => {
      try {
        navigate('/');
      } catch (error) {
        console.error("Failed to navigate:", error);
      }
    }, 5000);
  };

  // Polling for game state
  useEffect(() => {
    const pollGameState = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/games/game-state`);
        const gameData = response.data;

        // Update state only if the data has changed
        if (gameData) {
          setGrid(gameData.grid.blocks);
          setThiefPosition(gameData.grid.thiefPosition);
          setFarmerPosition(gameData.grid.farmerPosition);
          setTurn(gameData.currentTurn);
          setScores({
            farmer: gameData.players[0].score,
            thief: gameData.players[1].score,
            });
          setGameTimer(gameData.gameTimer);
          setTurnTimer(gameData.turnTimer);
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    };
    

    const intervalId = setInterval(pollGameState, 50); 

    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    if (gameTimer <= 0) {
      handleGameOver(); // Call handleGameOver when the timer hits 0
    }
  }, [gameTimer]);
  useEffect(() => {
    if (turnTimer <= 1) {
        switchTurns(); // Call switch turns if time runs out
    }
  }, [turnTimer]);

  return (
    <div className="container">
      <div className="player-name-display">
        <p>Player: {playerName || "Guest"}</p>
        <div className="profile-box">
          <img src={profilePicture} alt="Player Profile" className="player-profile-pic" />
        </div>

        {!gameOverMessage ? (
          <div className="gameplay-container">
            <GameHeader
              role={role}
              timeLeft={gameTimer}
              turn={turn}
              turnTimeLeft={turnTimer}
            />

            <GameBoard
              grid={grid}
              farmerPosition={farmerPosition}
              thiefPosition={thiefPosition}
              thiefImage={thiefImage}
            />

            <Scoreboard
              farmerScore={scores.farmer}
              thiefScore={scores.thief}
            />
             <div className="move-log-container">
        <h2>Move Log</h2>
        <ul className="move-log-list">
            {moveLogs.map((log, index) => (
                <li key={index} className="move-log-item">
                    {log}
                </li>
            ))}
        </ul>
    </div>
            <button onClick={refreshGame}>Refresh Game</button>
          </div>
        ) : (
          <div className="game-over-container">
            <h2>{gameOverMessage}</h2>
            <Scoreboard
              farmerScore={scores.farmer}
              thiefScore={scores.thief}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePlay;
