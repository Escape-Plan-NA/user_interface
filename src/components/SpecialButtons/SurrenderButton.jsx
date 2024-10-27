import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { io } from 'socket.io-client';
import Scoreboard from '../Scoreboard/Scoreboard'; // Adjust the import path as needed
import './SurrenderButton.css';

const socket = io(import.meta.env.VITE_SERVER_URL); // Connect to your server

function SurrenderButton() {
    const [currentTurn, setCurrentTurn] = useState('');
    const [scores, setScores] = useState({ farmer: 0, thief: 0 });
    const [gameOverMessage, setGameOverMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    //const [showScoreboard, setShowScoreboard] = useState(false);
    const navigate = useNavigate();

    // Fetch initial game data
    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/games/data`);
                const players = response.data.players || [];
                setCurrentTurn(response.data.currentTurn);
                setScores({
                    farmer: players.find(player => player.role === 'farmer')?.score || 0,
                    thief: players.find(player => player.role === 'thief')?.score || 0,
                });
            } catch (error) {
                console.error("Failed to fetch game data:", error);
            }
        };
        fetchGameData();

        // Listen for the surrender broadcast
        socket.on('surrender', (data) => {
            setGameOverMessage(data.message);
            setScores(data.updatedScores); // Update the scores from the broadcast
            //setShowScoreboard(true);
            setIsModalOpen(true);
        });

        // Clean up the socket connection on component unmount
        return () => {
            socket.off('surrender');
        };
    }, []);

    // Handle surrender
    const handleSurrender = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/games/surrender`, { role: currentTurn });
            const { updatedScores, winner } = response.data;

            // Update scores and display game over message
            console.log('Updated Scores:', updatedScores); // Debug statement
            setScores({
                farmer: updatedScores.find(player => player.role === 'farmer')?.score || 0,
                thief: updatedScores.find(player => player.role === 'thief')?.score || 0,
            });

            setGameOverMessage(`Game Over! ${winner} wins due to surrender.`);
            //setShowScoreboard(true);  // Show the scoreboard

            // Automatically close the modal and navigate to home after 3 seconds
            setTimeout(() => {
                setIsModalOpen(false);
                //setShowScoreboard(false);
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error("Failed to handle surrender:", error);
        }
    };

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>Surrender</button>

            {/* Modal for surrender confirmation and scoreboard */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        {gameOverMessage ? (
                            <>
                                <h2>{gameOverMessage}</h2>
                                
                                <button onClick={() => setIsModalOpen(false)}>Close</button>
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
