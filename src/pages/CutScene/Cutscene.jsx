import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './Cutscene.css';

const Cutscene = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/start');
    }, 20000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
      <button onClick={() => navigate('/start')}>skip</button>
    </div>
  );
};

export default Cutscene;
