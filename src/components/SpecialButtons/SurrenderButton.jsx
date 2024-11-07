// SurrenderButton.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { useWebSocket } from '../../context/WebSocketProvider'; // Use the existing WebSocket context
import Scoreboard from '../Scoreboard/Scoreboard'; // Adjust the import path as needed
import './SurrenderButton.css';

const SurrenderButton = ({ role }) => {
    const { socket } = useWebSocket(); // Access the existing socket connection
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

            // Set timeout to go back to main menu
            setTimeout(() => {
                setIsModalOpen(false);
                navigate('/'); // Adjust route as needed
            }, 5000);
        });

        // Clean up on component unmount
        return () => {
            socket.off('game_update');
            socket.off('surrender');
        };
    }, [socket, navigate]);

    // Emit "surrender" event to notify the server of the surrender action
    const handleSurrender = () => {
        socket.emit('surrender', { role: role }, (response) => {
            if (response && response.scores) {
                // Extract scores and winner information from server response
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

                 // Navigate to main menu after a short delay
                 setTimeout(() => {
                    setIsModalOpen(false);
                    navigate('/');
                }, 8000);
            } else {
                console.error("Surrender failed: Invalid response from server");
            }
        });
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
                            <div>
                            <div className="modal-message">
                                <h2>{gameOverMessage}</h2>
                                </div>
                                <div className='modal-scoreboard'>
                                <Scoreboard farmerScore={scores.farmer} thiefScore={scores.thief} /> {/* Scoreboard */}
                                </div>
                                </div>
                                
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
