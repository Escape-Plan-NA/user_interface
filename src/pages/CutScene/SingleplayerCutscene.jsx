// src/pages/CutScene/Cutscene.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';

const Cutscene = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode; // Get the submode (bot or friends) from the state

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRoleAssignment(); // Call function to assign role and navigate
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Function to handle role assignment and navigation
  const handleRoleAssignment = () => {
    // Randomize role: either 'farmer' or 'thief'
    const role = Math.random() < 0.5 ? 'farmer' : 'thief';

    // Based on the mode, navigate to the appropriate gameplay component
    if (mode === 'bot') {
      navigate('/bot', { state: { role } }); // Pass the role to the bot mode gameplay
    } else if (mode === 'friends') {
      navigate('/friends'); // Pass the role to the friends mode gameplay
    }
  };

  useEffect(() => {
    const handleBackNavigation = (event) => {
      event.preventDefault();
      navigate('/cutscene', { replace: true }); // Redirect to the current page
    };

    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', handleBackNavigation);

    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, [navigate]);

  return (
    <div className="cutscene-container">
      <h1>Cutscene Playing...</h1>
      <button onClick={handleRoleAssignment}>skip</button>
    </div>
  );
};

export default Cutscene;
