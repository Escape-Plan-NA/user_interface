import React, { createContext, useState } from 'react';

// Create a context for sound effects
export const SoundEffectContext = createContext();

// Provider component that wraps the application
export const SoundEffectProvider = ({ children }) => {
  // State to track whether sound effects are enabled
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  // Function to toggle sound effects
  const toggleSoundEffects = () => {
    setSoundEffectsEnabled(prev => {
      const newValue = !prev; // Determine the new value
      console.log(`Toggle sound effect to: ${newValue}`); // Log the new value
      return newValue; // Update the state with the new value
    });
  };

  // Provide state and function to the context
  return (
    <SoundEffectContext.Provider value={{ soundEffectsEnabled, toggleSoundEffects }}>
      {children}
    </SoundEffectContext.Provider>
  );
};
