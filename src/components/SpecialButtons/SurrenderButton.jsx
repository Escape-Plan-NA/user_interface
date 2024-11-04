// SurrenderButton.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import Scoreboard from '../Scoreboard/Scoreboard'; // Adjust the import path as needed
import './SurrenderButton.css';

const socket = io("http://127.0.0.1:3000"); // Initialize Socket.IO connection

const SurrenderButton = ({role}) => {
    const [scores, setScores] = useState({ farmer: 0, thief: 0 });
    const [gameOverMessage, setGameOverMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for the initial game data when component mounts
        socket.on('game_update', (data) => {
            const players = data.players || [];
            setScores({
                farmer: players.find(player => player.role === 'farmer')?.score || 0,
                thief: players.find(player => player.role === 'thief')?.score || 0,
            });
        });

        // Listen for the "surrender" event broadcast to update game state
        socket.on('surrender', (data) => {
            setGameOverMessage(data.message);
            setScores({
                farmer: data.scores?.farmer || 0,
                thief: data.scores?.thief || 0
            });
            setIsModalOpen(true);

            closeAndNavigateHome();

            setTimeout(() => setGameOverMessage(null), 4000);
        });

        // Clean up on component unmount
        return () => {
            socket.off('game_update');
            socket.off('surrender');
        };
    }, []);

    // Emit "surrender" event to notify the server of the surrender action
    const handleSurrender = () => {
        socket.emit('surrender', { role: role }, (response) => {
            if (response && response.scores) {
                // Extract scores and winner information from server response
                console.log(response);
                const { scores, winner } = response;
    
                // Update the scores in the state
                setScores({
                    farmer: scores.farmer || 0,
                    thief: scores.thief || 0,
                });
    
                // Display game over message
                const gameOverMsg = `Game Over! ${winner} wins due to surrender.`;
                setGameOverMessage(gameOverMsg);
    
                // Show modal with game over message
                setIsModalOpen(true);

                closeAndNavigateHome();
                
                setTimeout(() => setGameOverMessage(null), 4000);
            } else {
                console.error("Surrender failed: Invalid response from server");
            }
        });
    };   

    const closeAndNavigateHome = () => {
        const timer = setTimeout(() => {
            setIsModalOpen(false);
            socket.emit('resetFromSurrender');
        }, 5000);

        return () => clearTimeout(timer); // Cleanup timeout on unmount
    };

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>Surrender</button>

            {/* Modal for surrender confirmation and scoreboard */}
            {isModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal">
                        {gameOverMessage ? (
                            <>
                                <h2>{gameOverMessage}</h2>
                                <Scoreboard farmerScore={scores.farmer} thiefScore={scores.thief} /> {/* Scoreboard */}
                                <button onClick={() => setIsModalOpen(false)} autoFocus>Close</button>
                            </>
                        ) : (
                            <>
                                <h2>Are you sure you want to surrender?</h2>
                                <button onClick={handleSurrender}>Yes, Surrender</button>
                                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SurrenderButton;
