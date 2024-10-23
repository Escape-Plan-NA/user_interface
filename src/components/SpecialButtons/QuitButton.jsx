import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuitGameButton = ({ quitGame }) => {
  const navigate = useNavigate();

  const handleQuit = () => {
    // Reset the game state
    quitGame();

    // Navigate to the homepage (you can change this route if needed)
    navigate('/');
  };

  return (
    <button onClick={handleQuit}>
      Quit Game
    </button>
  );
};

export default QuitGameButton;
