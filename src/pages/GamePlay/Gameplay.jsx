import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GameHeader from '../../components/GameHeader/GameHeader.jsx';
import GameBoard from '../../components/GameBoard/GameBoard.jsx';
import Scoreboard from '../../components/Scoreboard/Scoreboard.jsx';

const GamePlay = () => {
  const navigate = useNavigate();
  const role = 'thief';
  const [timeLeft, setTimeLeft] = useState(60); // 3-minute overall game timer
  const [gameOverMessage, setGameOverMessage] = useState(null);  // State for game over message
  const [grid, setGrid] = useState([]);
  const [farmerPosition, setFarmerPosition] = useState(null);
  const [thiefPosition, setThiefPosition] = useState(null);
  const [turn, setTurn] = useState(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10); // 10-second turn timer
  const [scores, setScores] = useState({ farmer: 0, thief: 0 }); // Score tracking
  const thiefImage = import.meta.env.VITE_THIEF_IMAGE;
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

    startGame(); // Start the game when the component mounts

    // Cleanup function to reset the game state when the component unmounts
    return async () => {
      // If this is the first render, skip the cleanup
      if (isFirstRender.current) {
        isFirstRender.current = false;
      } else {
        try {
          // Call the backend API to reset the game state
          await axios.post(`${import.meta.env.VITE_SERVER_URL}/games/reset-game`);
          // Log a message when the player exits the gameplay page
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
  
    // Listen for beforeunload event (when the user refreshes or closes the tab)
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      // Trigger API when the component unmounts (user navigates away or clicks back)
      handleBeforeUnload();
  
      // Cleanup the event listener when the component unmounts
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  


  const startGame = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/games/start`);
      const gameData = response.data.gameData;

      setGrid(gameData.grid.blocks || []); // Ensure the grid is always an array
      setThiefPosition(gameData.grid.thiefPosition);
      setFarmerPosition(gameData.grid.farmerPosition);
      setTurn(gameData.currentTurn); // Set the initial turn
    } catch (error) {
      console.error("Failed to start the game:", error);
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const gameTimer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(gameTimer);
    } else {
      handleGameOver(); // End the game when the timer runs out
    }
  }, [timeLeft]);


  // Handle the turn timer (turnTimeLeft)
  useEffect(() => {
    if (turnTimeLeft > 0) {
      const turnTimer = setInterval(() => {
        setTurnTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(turnTimer);
    } else {
      switchTurns();  // Switch turns when the timer runs out
    }
  }, [turnTimeLeft]);


  const switchTurns = async () => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/games/switch-turn`);
      const updatedGameState = response.data;

      setTurn(updatedGameState.currentTurn);
      setTurnTimeLeft(10); // Reset the turn timer to 10 seconds after the turn switches
    } catch (error) {
      console.error("Error switching turn:", error);
    }
  };


  // Handle player movement
  useEffect(() => {
    let moveInProgress = false;
    const handleKeyPress = async (e) => {
      if (moveInProgress) return; // Prevent multiple moves at the same time
      moveInProgress = true;

      if (turn !== role) {
        console.log(`It's the ${turn}'s turn. You (${role}) cannot move.`);
        moveInProgress = false;
        return;
      }

      let currentPosition = role === "farmer" ? { ...farmerPosition } : { ...thiefPosition };
      let newPosition = { ...currentPosition }; // Create a copy to calculate new position

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

      // Check if the move is valid (if the new position is different from the current one)
      if (newPosition.row === currentPosition.row && newPosition.col === currentPosition.col) {
        console.log("Invalid move: outside the grid boundaries.");
        moveInProgress = false;
        return; // Exit if no valid move
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

        // Reset the turn timer after a valid move
        setTurnTimeLeft(10);  // Reset to 10 seconds after each move

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
    if (gameWon) return; // Prevent multiple triggers

    if (turn === "thief") {
      // Thief's turn win conditions
      if (currentPosition.row === farmerPosition.row && currentPosition.col === farmerPosition.col) {
        gameWon = true;
        alert(`Farmer catches the thief! Farmer wins! \nCurrent Scores:\nFarmer: ${scores.farmer + 1}, Thief: ${scores.thief}`);
        await updateScore('farmer'); // Farmer wins and should start the next game
      } else if (grid[currentPosition.row][currentPosition.col] === 'tunnel') {
        gameWon = true;
        setThiefPosition(currentPosition);
        alert(`Thief reaches the tunnel! Thief wins! \nCurrent Scores:\nFarmer: ${scores.farmer}, Thief: ${scores.thief + 1}`);
        await updateScore('thief'); // Thief wins and should start the next game
      }
    } else if (turn === "farmer") {
      // Farmer's turn win condition (catching the thief)
      if (currentPosition.row === thiefPosition.row && currentPosition.col === thiefPosition.col) {
        gameWon = true;
        alert(`Farmer catches the thief! Farmer wins! \nCurrent Scores:\nFarmer: ${scores.farmer + 1}, Thief: ${scores.thief}`);
        await updateScore('farmer'); // Farmer wins and should start the next game
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

      // Set the winner as the first player in the next game
      setTurn(winner);

      await startGame(); // Restart the game
      gameWon = false; // Reset flag
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
      winner = 'No one'; // In case of a tie
    }

    // Display the game over message with the current scores
    setGameOverMessage(`Game Over, ${winner} wins!!!\nFarmer: ${scores.farmer}, Thief: ${scores.thief}`);

    // Set a timeout for 5 seconds to display the message and then redirect
    setTimeout(() => {
      try {
        // Redirect to the menu page
        navigate('/');
      } catch (error) {
        console.error("Failed to navigate:", error);
      }
    }, 5000); // Wait for 5 seconds before redirecting
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

    fetchPlayerName(); // Call the fetch function
  }, []);

  return (
    <>
  <div className="container">
    <div className="player-name-display">
    <p>Player: {playerName || "Guest"}</p> {/* Show the player name */}
      <div className="profile-box">
        <img src={profilePicture} alt="Player Profile" className="player-profile-pic" />
      </div>
    </div>
    
    <div className="gameplay-container">
      <div className="game-board">
        <GameHeader
          role={role}
          timeLeft={timeLeft}
          turn={turn}
          turnTimeLeft={turnTimeLeft}
        />
        
        <GameBoard
          grid={grid}
          farmerPosition={farmerPosition}
          thiefPosition={thiefPosition}
          thiefImage={thiefImage}
        />
      </div>
      
      <div className="scoreboard-container">
        <Scoreboard
          farmerScore={scores.farmer}
          thiefScore={scores.thief}
        />
        <div className="move-history">
          <h3>Move History</h3>
          {/* Placeholder for move history content */}
          <div className="move-history-content">No moves made yet!</div>
        </div>
      </div>
    </div>
  </div>

  {gameOverMessage && <div className="game-over-message">{gameOverMessage}</div>}
  
  <button onClick={refreshGame}>Refresh Game</button>
</>

  );
  
};

export default GamePlay;
