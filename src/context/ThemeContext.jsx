// context/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to toggle dark mode and add a grayscale filter
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Effect to add or remove the dark-mode class and grayscale filter
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.filter = 'grayscale(100%)';  // Add grayscale filter
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.filter = 'none';  // Remove grayscale filter
    }
  }, [isDarkMode]); // Re-run effect when isDarkMode changes

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
