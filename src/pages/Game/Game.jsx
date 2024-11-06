import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWebSocket } from '../../context/WebSocketProvider';
import GameHeader from '../../components/GameHeader/GameHeader.jsx';
import GameBoard from '../../components/GameBoard/GameBoard.jsx';
import Scoreboard from '../../components/Scoreboard/Scoreboard.jsx';
import { SoundEffectContext } from "../../context/SoundEffectContext.jsx";
import { imageMap } from '../../utils/imageMap';
import './Game.css';
import Chat from '../../components/Chat/Chat.jsx';
import WinModal from '../../components/Modal/WinModal.jsx';
import GameOverModal from '../../components/Modal/GameOverModal.jsx'; // Import GameOverModal

const Game = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { socket } = useWebSocket();
    const { role, username, gameData } = location.state || { gameData: { players: [] } };

    const [grid, setGrid] = useState([]);
    const [thiefPosition, setThiefPosition] = useState({ row: 1, col: 1 });
    const [farmerPosition, setFarmerPosition] = useState({ row: 1, col: 1 });
    const [turn, setTurn] = useState("");
    const [scores, setScores] = useState({ farmer: 0, thief: 0 });
    const [finalScores, setFinalScores] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [turnTimeLeft, setTurnTimeLeft] = useState(10);
    const [logs, setLogs] = useState([]);
    const [winMessage, setWinMessage] = useState("");
    const [sessionEnded, setSessionEnded] = useState(false);
    const { soundEffectsEnabled } = useContext(SoundEffectContext);

    const [showWinModal, setShowWinModal] = useState(false);
    const [showGameOverModal, setShowGameOverModal] = useState(false); // New state for GameOverModal
    const [winnerData, setWinnerData] = useState(null);

    const farmer = gameData?.players?.find(player => player.role === 'farmer') || {};
    const thief = gameData?.players?.find(player => player.role === 'thief') || {};

    const farmerName = farmer.username || "Farmer";
    const thiefName = thief.username || "Thief";
    const farmerImage = farmer.image_id ? imageMap[farmer.image_id]?.farmer : "/assets/characters/default_farmer.gif";
    const thiefImage = thief.image_id ? imageMap[thief.image_id]?.thief : "/assets/characters/default_thief.gif";

    const sounds = useRef({
        farmerMove: new Audio("/soundEffects/farmer_move.mp3"),
        thiefMove: new Audio("/soundEffects/thief_move.mp3"),
        farmerWin: new Audio("/soundEffects/farmer_win.mp3"),
        thiefWin: new Audio("/soundEffects/thief_win.mp3"),
        tieGame: new Audio("/soundEffects/tieGame.mp3")
    });

    useEffect(() => {
        if (soundEffectsEnabled) {
            Object.values(sounds.current).forEach(sound => sound.load());
        }
    }, [soundEffectsEnabled]);

    const playSound = (sound) => {
        if (soundEffectsEnabled && sound) {
            sound.play().catch(error => console.error("Error playing sound:", error));
        }
    };

    const fetchFinalScores = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/final-scores');
            const scores = response.data.scores;
            setFinalScores(scores);
            
            if (scores.farmer > scores.thief) {
                setWinMessage(`${farmerName} (farmer) ${scores.farmer} : ${thiefName} (thief) ${scores.thief}`);
            } else if (scores.thief > scores.farmer) {
                setWinMessage(`${thiefName} (thief) ${scores.thief} : ${farmerName} (farmer) ${scores.farmer}`);
            } else {
                setWinMessage(`${farmerName} (farmer) ${scores.farmer} : ${thiefName} (thief) ${scores.thief} - It's a tie!`);
            }
        } catch (error) {
            console.error("Error fetching final scores:", error);
        }
    };

    useEffect(() => {
        if (!socket) return;

        socket.emit("start-game");

        socket.on("gameStarted", () => {
            setTimeout(() => {
                socket.emit("requestGameState");
            }, 500);
        });

        socket.on("gameState", (gameData) => {
            setGrid(gameData.grid.blocks || []);
            setThiefPosition(gameData.grid.thiefPosition);
            setFarmerPosition(gameData.grid.farmerPosition);
            setTurn(gameData.currentTurn);

            if (!sessionEnded) {
                setScores({
                    farmer: gameData.players[0].score,
                    thief: gameData.players[1].score,
                });
            }
        });

        socket.on("timerUpdate", ({ timeLeft, turnTimeLeft }) => {
            setTimeLeft(timeLeft);
            setTurnTimeLeft(turnTimeLeft);
        });

        socket.on("sessionEnded", () => {
            setSessionEnded(true);
            fetchFinalScores();
            setShowGameOverModal(true); // Show the GameOverModal when session ends
        });

        socket.on("winner", ({ winner, scores }) => {
            setScores(scores);
            playSound(winner === "farmer" ? sounds.current.farmerWin : sounds.current.thiefWin);

            setWinnerData({ 
                message: `${winner === "farmer" ? "Farmer" : "Thief"} wins!`, 
                role: winner, 
                scores 
            });
            setShowWinModal(true);
        });

        socket.on('leftGame', () => {
            console.log("Received 'leftLobby' event, redirecting to main menu.");
            navigate('/');
        });

        return () => {
            socket.off("gameStarted");
            socket.off("gameState");
            socket.off("timerUpdate");
            socket.off("winner");
            socket.off("leftGame");
            socket.off("sessionEnded");
        };
    }, [socket, navigate, sessionEnded]);

    const handleKeyPress = (e) => {
        if (turn !== role) return;

        let direction = "";
        switch (e.key) {
            case "ArrowUp": direction = "up"; break;
            case "ArrowDown": direction = "down"; break;
            case "ArrowLeft": direction = "left"; break;
            case "ArrowRight": direction = "right"; break;
            default: return;
        }

        socket.emit("move", { role, direction });
        playSound(role === "farmer" ? sounds.current.farmerMove : sounds.current.thiefMove);
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [turn, role]);

    useEffect(() => {
        socket.on("moveLog", (message) => {
            setLogs((prevLogs) => {
                const updatedLogs = [...prevLogs, message];
                return updatedLogs.slice(-4);
            });
        });

        return () => {
            socket.off("moveLog");
        };
    }, [socket]);

    const resetGame = () => {
        socket.emit("resetGame");
    };

    const closeWinModal = () => {
        setShowWinModal(false);
    };

    // Automatically close the WinModal after 1.5 seconds if not manually closed
    useEffect(() => {
        if (showWinModal) {
            const timer = setTimeout(() => {
                setShowWinModal(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showWinModal]);

    // Automatically close GameOverModal and navigate after 3 seconds
    useEffect(() => {
        if (showGameOverModal) {
            const timer = setTimeout(() => {
                setShowGameOverModal(false);
                navigate('/');
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [showGameOverModal, navigate]);

    return (
        <div className="container">
          <div className="background-front"></div> 
            {sessionEnded && !showGameOverModal && (
                <div className="win-message">
                    <h2>Game Over</h2>
                    <p>{winMessage}</p>
                </div>
            )}
            
            {showGameOverModal && (
                <GameOverModal
                    resultMessage={winMessage}
                    winnerName={winnerData?.message.split(' ')[0]}
                    winnerRole={winnerData?.role}
                    scores={scores}
                    onClose={() => setShowGameOverModal(false)}
                />
            )}
            
            {showWinModal && (
                <WinModal 
                    message={winnerData.message}
                    role={winnerData.role}
                    scores={winnerData.scores}
                    onClose={closeWinModal}
                />
            )}
            
            <div className="player-name-display">
                <p>Player: {username || "Guest"}</p>
                
                <GameHeader 
                    role={role} 
                    timeLeft={timeLeft} 
                    turn={turn} 
                    turnTimeLeft={turnTimeLeft}
                    username={username}
                />
                
                <Chat username={username} />
                
                <div className="gameboard-container">
                    <GameBoard
                        grid={grid}
                        farmerPosition={farmerPosition}
                        thiefPosition={thiefPosition}
                        farmerImage={farmerImage}
                        thiefImage={thiefImage}
                        farmerName={farmerName}
                        thiefName={thiefName}
                    />
                    
                    <Scoreboard 
                        farmerScore={scores.farmer}
                        thiefScore={scores.thief}
                        farmerName={farmerName}
                        thiefName={thiefName}
                    />

                    <div className="bottom-controls">
                        <h3>Move Logs</h3>
                        <ul className="move-logs">
                            {logs.map((log, index) => (
                                <li key={index}>{log}</li>
                            ))}
                        </ul>
                        <button className="reset-button" onClick={resetGame}>Reset</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
