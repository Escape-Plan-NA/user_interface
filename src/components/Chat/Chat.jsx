import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"; // Import socket.io client
import { usePlayer } from "../../context/PlayerContext";
import "./Chat.css";

const socket = io("http://localhost:3000"); // Connect to server on port 3000

const Chat = () => {
    const [messages, setMessages] = useState([]); // Chat messages
    const [input, setInput] = useState(""); // Message input
    const [isOpen, setIsOpen] = useState(true); // Chat toggle
    const { playerName } = usePlayer();

    useEffect(() => {
        // Listen for incoming messages
        socket.on("chat-message", (data) => {
            setMessages((prevMessages) => [...prevMessages, data]); // Append new message to messages array
        });

        return () => {
        socket.off("chat-message"); // Clean up the event listener
        };
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
        const messageData = { 
            message: input, 
            sender: playerName, 
            timestamp: new Date() 
        };
        console.log(playerName);
        setMessages([...messages, messageData]); // Display sent message
        socket.emit("message", messageData); // Emit message to server
        setInput(""); // Clear input field
        }
    };

    return (
        <div className="chat-container">
        <div className="chat-header" onClick={() => setIsOpen(!isOpen)}>
            Chat {isOpen ? "▲" : "▼"}
        </div>

        {isOpen && (
            <>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                <div key={index} className="chat-message">
                    <strong>{msg.sender}: </strong>
                    {msg.message}
                </div>
                ))}
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
            </>
        )}
        </div>
    );
};

export default Chat;
