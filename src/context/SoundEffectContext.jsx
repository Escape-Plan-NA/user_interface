// SoundEffectContext.jsx
import React, { createContext, useState } from 'react';

export const SoundEffectContext = createContext();

export const SoundEffectProvider = ({ children }) => {
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  const toggleSoundEffects = () => {
    setSoundEffectsEnabled(prev => !prev);
    console.log(`toggle sound effect to: ${soundEffectsEnabled}`);
  };

  return (
    <SoundEffectContext.Provider value={{ soundEffectsEnabled, toggleSoundEffects }}>
      {children}
    </SoundEffectContext.Provider>
  );
};
