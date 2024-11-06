import React from 'react';
import './GameOverModal.css';

const GameOverModal = ({ resultMessage, winnerName, winnerRole, scores, onClose }) => {
    return (
        <div className="gameover-modal-overlay">
            <div className="gameover-modal-content">
                <h2>Game Over</h2>
                <p className="result-message">{resultMessage}</p>
                <div className="winner-details">
                    <p><strong>Winner:</strong> {winnerName} ({winnerRole})</p>
                    <p><strong>Scores:</strong></p>
                    <p>Farmer: {scores.farmer}</p>
                    <p>Thief: {scores.thief}</p>
                </div>
                <p className="redirect-message">Redirecting to main menu...</p>
            </div>
        </div>
    );
};

export default GameOverModal;
