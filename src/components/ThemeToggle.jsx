// components/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx'; // Import the theme context

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Get theme state and toggle function

  return (
    <button 
      className="theme-toggle nav-button" 
      onClick={toggleTheme}
       // Green when dark mode is on, red when off
    >
      {isDarkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
};

export default ThemeToggle;
