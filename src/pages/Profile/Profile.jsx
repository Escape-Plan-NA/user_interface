import React, { useState, useEffect } from "react";
import "./Profile.css"; // Import your CSS file for styling
import { useNavigate } from "react-router-dom";

function Profile() {
  const [girlChar, setGirlChar] = useState([]);
  const [boyChar, setBoyChar] = useState([]);
  const [imageOptions, setImageOptions] = useState([]);
  const [profilePicture, setProfilePicture] = useState("src/assets/placeholderProfile.jpg");
  const [playerName, setPlayerName] = useState("Guest");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const girlImages = ["src/assets/dora_explorer_show.jpg", "src/assets/dora_explorer_show.jpg", "src/assets/dora_explorer_show.jpg"];
  const boyImages = ["src/assets/Diego.jpg", "src/assets/Diego.jpg", "src/assets/Diego.jpg"];

  let navigate = useNavigate();

  const routeChange = () => {
    let path = '/start';
    navigate(path);

  }

  useEffect(() => {
    const savedPlayerName = localStorage.getItem("playerName");
    const savedProfilePicture = localStorage.getItem("profilePicture");
    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
    }
    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture.toString()); //
    }

  }, []);  // Load the saved data from localStorage when the component mounts

  const handlePlayerNameChange = (event) => {
    setPlayerName(event.target.value);
    localStorage.setItem('playerName', event.target.value);
  }

  const handleBoyCharacter = () => {
    console.log("Boy character selected");
    setImageOptions(boyImages);
    setIsModalOpen(true);

  };

  const handleGirlCharacter = () => {
    console.log("Girl character selected");
    setImageOptions(girlImages);
    setIsModalOpen(true);  
    
    

  };

  const handleProfilePictureChange = (url, index) => {
    console.log(`Selected image URL: ${url}`);
    setProfilePicture(url);
    localStorage.setItem('profilePicture', url);
    setIsModalOpen(false);
  };



  const handleSubmit = () => {
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("profilePicture", profilePicture);
    alert("Profile saved successfully");




  };

  return (
    <div className="profile-container">
      <div className="profile-left">
        <div className="profile-title" id="profile-title">
          <h1>PROFILE</h1>
        </div>

        <div id="profile-picture-container" className="image-container">
          <img
            src={profilePicture || "src/assets/dora_explorer_show.jpg"} // Default profile picture
            alt="Profile"
            className="profile-img"
          />

        </div>

        <div><h2>Player: {playerName}</h2></div>
        <button onClick={routeChange}>Start Game</button>

      </div>
      <div className="profile-right">
        <div className="enter-info-name">
          <label className="selection-display-text">Name:</label>
          <input className="enter-name-form" placeholder="Enter name" value={playerName} onChange={handlePlayerNameChange} />
        </div>
        <div className="enter-info">

          <div className="side-by-side-button">
            <label className="selection-display-text">Sex:</label>
            <button className="side-by-side-left-button" onClick={handleBoyCharacter}>Boy</button>
            <button className="side-by-side-right-button" onClick={handleGirlCharacter}>Girl</button>
          </div></div>
        <div className="enter-info">
          <h2 className="selection-display-text">Select Character</h2>
          <div className="image-options">
            {imageOptions.map((url, index) => (
              <img
                src={url}
                alt={`Option ${index + 1}`}
                key={index}
                className="option-img"
                onClick={() => handleProfilePictureChange(url, index)} // Corrected onClick
              />
            ))}
          </div>
        </div>
        <div className="side-by-side-button">
          <button className="side-by-side-left-button" onClick={handleSubmit}>Submit</button>
          <button className="side-by-side-right-button" onClick={() => navigate('/')}>Main Menu</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
