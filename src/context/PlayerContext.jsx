// src/context/PlayerContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the context
const PlayerContext = createContext();

// Create a provider component
export const PlayerProvider = ({ children }) => {
    const [playerName, setPlayerName] = useState('');
    const [profilePicture, setProfilePicture] = useState('src/assets/placeholderProfile.jpg');

    return (
        <PlayerContext.Provider value={{ playerName, setPlayerName, profilePicture, setProfilePicture }}>
            {children}
        </PlayerContext.Provider>
    );
};

// Custom hook to use the PlayerContext
export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
