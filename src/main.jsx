import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './App.css';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import { SoundEffectProvider } from './context/SoundEffectContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AudioProvider>
      <ThemeProvider>
        <SoundEffectProvider>
          <App />
        </SoundEffectProvider>
      </ThemeProvider>
    </AudioProvider>

  </StrictMode>,
)

//audioProvider--> Manages audio playback globally
//ThemeProvider--> Manages dark and light theme globally
//SoundEffectProvider--> Manages sound effects globally