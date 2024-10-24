import React, { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';

const Cutscene = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode; // Get the mode (bot or friends) from the state
  const role = location.state?.role; // Get the selected role from the state
  const difficulty = location.state?.difficulty; // Get the difficulty

  useEffect(() => {
    console.log("Mode: ", mode);
    console.log("Role: ", role);
    console.log("Difficulty: ", difficulty);

    const timer = setTimeout(() => {
      handleRoleAssignment(); // Call function to assign role and navigate
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Function to handle role assignment and navigation
  const handleRoleAssignment = () => {
    console.log('Mode:', mode, 'Difficulty:', difficulty, 'Role:', role);
    // Based on the mode and the selected role, navigate to the appropriate gameplay component
    if (mode === 'bot' && difficulty === 'easy') {
      navigate('/botEasy', { state: { role } }); // Pass the selected role to the bot mode gameplay
    } else if (mode === 'bot' && difficulty === 'hard') {
      navigate('/botHard', { state: { role } });
    } else if (mode === 'friends') {
      navigate('/friends'); // Navigate to friends mode gameplay
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
      <button onClick={() => handleRoleAssignment()}>skip</button>
    </div>
  );
};

export default Cutscene;
