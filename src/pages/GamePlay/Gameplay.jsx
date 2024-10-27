import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GameHeader from '../../components/GameHeader/GameHeader.jsx';
import GameBoard from '../../components/GameBoard/GameBoard.jsx';
import Scoreboard from '../../components/Scoreboard/Scoreboard.jsx';
import farmer from '../../assets/Character/White/White(T).gif';
import thief from '../../assets/Character/White/White(Th).gif';

const GamePlay = () => {
  const navigate = useNavigate();
  const role = 'thief';
  const [timeLeft, setTimeLeft] = useState(15); // 3-minute overall game timer
  const [gameOverMessage, setGameOverMessage] = useState(null);  // State for game over message
  const [grid, setGrid] = useState([]);
  const [farmerPosition, setFarmerPosition] = useState(null);
  const [thiefPosition, setThiefPosition] = useState(null);
  const [turn, setTurn] = useState(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10); // 10-second turn timer
  const [scores, setScores] = useState({ farmer: 0, thief: 0 }); // Score tracking
  const thiefImage = thief;
  const farmerImage = farmer;
  const isFirstRender = useRef(true);
  const [playerName, setPlayerName] = useState('');
  const [profilePicture, setProfilePicture] = useState(''); // State for profile picture
  let gameWon = false; // Prevent multiple win triggers

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users/getUser'); // Fetch user data
        setPlayerName(response.data.user.name); // Set the player name in state
        setProfilePicture(response.data.user.profilePicture); // Set the profile picture in state
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData(); // Call the fetch function
  }, []);

  useEffect(() => {
    // Log a welcome message when the player enters the gameplay page
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

  const handleGameOver = () => {
    let winner;
    if (scores.farmer > scores.thief) {
      winner = 'Farmer';
    } else if (scores.thief > scores.farmer) {
      winner = 'Thief';
    } else {
      winner = 'No one'; 
    }

    setGameOverMessage(`Game Over, ${winner} wins!!!`);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const gameTimer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(gameTimer);
    } else {
      handleGameOver();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (turnTimeLeft > 0) {
      const turnTimer = setInterval(() => {
        setTurnTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(turnTimer);
    } else {
      switchTurns();
    }
  }, [turnTimeLeft]);

  const switchTurns = async () => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/games/switch-turn`);
      const updatedGameState = response.data;

      setTurn(updatedGameState.currentTurn);
      setTurnTimeLeft(10); 
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

        setTurnTimeLeft(10);

        checkWinConditions(newPosition);

      } catch (error) {
        console.error("Error processing move:", error.response ? error.response.data : error.message);
      } finally {
        moveInProgress = false;
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

      setTimeLeft(15);
      setTurnTimeLeft(10);

    } catch (error) {
      console.error("Error refreshing game:", error);
    }
  };

  useEffect(() => {
    const fetchPlayerName = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/getUser`); // Fetch player name
        setPlayerName(response.data.user.name); // Set the player name in state
      } catch (error) {
        console.error("Error fetching player name:", error);
      }
    };

    fetchPlayerName(); 
  }, []);

  return (
    <div className="container">
      {/* Game Header positioned at the top left */}

      {/* Game Board and other content */}
      <div className="background-front"></div> {/* Front background layer */}

      <div className="player-name-display">
        <p>Player: {playerName || "Guest"}</p>

        {!gameOverMessage ? (
          <>
            <GameHeader 
              role={role} 
              timeLeft={timeLeft} 
              turn={turn} 
              turnTimeLeft={turnTimeLeft} />
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
            <button onClick={refreshGame}>Refresh Game</button>
          </div>
          </>
        ) : (
          <div className="game-over-container">
            <Scoreboard 
            winMessage={gameOverMessage}
            farmerScore={scores.farmer} 
            thiefScore={scores.thief} 
            farmerName="Kiak"  // Replace with the actual farmer name
            thiefName="Guest"
            />
          <button onClick={refreshGame}>Restart</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePlay;
