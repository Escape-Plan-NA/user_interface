// AudioContext.js
import React, { createContext, useState } from 'react';
import forestSounds from '../assets/soundEffects/forest_sounds.mp3';

const AudioContext = createContext();

const AudioProvider = ({ children }) => {
    const [audio] = useState(new Audio(forestSounds));
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleAudio = () => {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
            audio.loop = true; // Optional: loop the audio continuously
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <AudioContext.Provider value={{ isPlaying, toggleAudio }}>
            {children}
        </AudioContext.Provider>
    );
};

export { AudioContext, AudioProvider };
