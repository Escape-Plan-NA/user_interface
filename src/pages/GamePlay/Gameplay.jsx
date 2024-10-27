import React, { useEffect, useState, useRef, useContext } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import GameHeader from '../../components/GameHeader/GameHeader.jsx';
import GameBoard from '../../components/GameBoard/GameBoard.jsx';
import Scoreboard from '../../components/Scoreboard/Scoreboard.jsx';
import { SoundEffectContext } from "../../context/SoundEffectContext.jsx";

import farmerMoveSound from '../../assets/farmer_move.mp3';
import thiefMoveSound from '../../assets/thief_move.mp3';
import farmerWinSound from '../../assets/farmer_win.mp3';
import thiefWinSound from '../../assets/thief_win.mp3';
import tieGameSound from '../../assets/tieGame.mp3';

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
  const { soundEffectsEnabled } = useContext(SoundEffectContext);

  let gameWon = false; // Prevent multiple win triggers


  // Preloaded audio files
  const sounds = useRef({
    farmerMove: new Audio(farmerMoveSound),
    thiefMove: new Audio(thiefMoveSound),
    farmerWin: new Audio(farmerWinSound),
    thiefWin: new Audio(thiefWinSound),
    tieGame: new Audio(tieGameSound)
  });

  useEffect(() => {
    if (soundEffectsEnabled) {
      Object.values(sounds.current).forEach(sound => sound.load());
    }
  }, [soundEffectsEnabled]);

  // Function to play sound
  const playSound = (sound) => {
    if (soundEffectsEnabled && sound) {
      sound.play().catch(error => console.error("Error playing sound:", error));
    }
  };


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

  const startGame = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/games/start`);
      const gameData = response.data.gameData;

      setGrid(gameData.grid.blocks || []);
      setThiefPosition(gameData.grid.thiefPosition);
      setFarmerPosition(gameData.grid.farmerPosition);
      setTurn(gameData.currentTurn);
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
        //play sound according to the move
        playSound(role === 'farmer' ? sounds.current.farmerMove : sounds.current.thiefMove);

    

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
        playSound(sounds.current.farmerWin);
        alert(`Farmer catches the thief! Farmer wins! \nCurrent Scores:\nFarmer: ${scores.farmer + 1}, Thief: ${scores.thief}`);

        await updateScore('farmer');
      } else if (grid[currentPosition.row][currentPosition.col] === 'tunnel') {
        gameWon = true;
        setThiefPosition(currentPosition);
        playSound(sounds.current.thiefWin);
        alert(`Thief reaches the tunnel! Thief wins! \nCurrent Scores:\nFarmer: ${scores.farmer}, Thief: ${scores.thief + 1}`);

        await updateScore('thief');
      }
    } else if (turn === "farmer") {
      if (currentPosition.row === thiefPosition.row && currentPosition.col === thiefPosition.col) {
        gameWon = true;
        playSound(sounds.current.farmerWin);
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
    let winnerSound;
    if (scores.farmer > scores.thief) {
      winner = 'Farmer';
      winnerSound = farmerWin;
    } else if (scores.thief > scores.farmer) {
      winner = 'Thief';
      winnerSound = thiefWin;
    } else {
      winner = 'No one';
      winnerSound = tieGame;
    }

    setGameOverMessage(`Game Over, ${winner} wins!!!\nFarmer: ${scores.farmer}, Thief: ${scores.thief}`);
    playSound(winnerSound);
    setTimeout(() => {
      try {
        navigate('/');
      } catch (error) {
        console.error("Failed to navigate:", error);
      }
    }, 5000);
  };

  useEffect(() => {
    const fetchPlayerName = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/getUser`);
        setPlayerName(response.data.name);
      } catch (error) {
        console.error("Error fetching player name:", error);
      }
    };

    fetchPlayerName();
  }, []);

  return (
    <>
      <div className="player-name-display">
        <h2>Welcome {playerName}</h2>
      </div>

      {!gameOverMessage ? (
        <div className="gameplay-container">
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

          <Scoreboard
            farmerScore={scores.farmer}
            thiefScore={scores.thief}
          />

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
    </>
  );
};

export default GamePlay;
