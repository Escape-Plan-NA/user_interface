import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa'; // Import the icons
import { useTheme } from '../context/ThemeContext.jsx'; // Import the theme context

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Get theme state and toggle function

  return (
    <button 
      className="theme-toggle nav-icon" 
      onClick={toggleTheme}
      title="Toggle Theme"
    >
      {/* Use the icons based on the theme state */}
      {isDarkMode ? <FaMoon style={{ color: "#FFD700" }} /> : <FaSun style={{ color: "#FFD700" }} />}
    </button>
  );
};

export default ThemeToggle;
