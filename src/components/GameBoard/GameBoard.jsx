import React from 'react';
import './GameBoard.css';
import { mapThemes } from '../../utils/mapThemes';

const GameBoard = ({ grid, selectedTheme, farmerPosition, thiefPosition, thiefImage, farmerImage, farmerName, thiefName }) => {
  const currentTheme = mapThemes[selectedTheme] || mapThemes.autumn;  // Default to autumn if theme not provided
  return (
    <div className="gameboard-container">
      <table className="game-table">
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((block, colIndex) => (
                <td key={colIndex}
                  className={`table-cell ${block}`}
                  style={{ backgroundImage: `url(${currentTheme[block]})` }}>
                  {block === 'obstacle' && <img src={currentTheme.obstacle} alt="Obstacle" />}
                  {block === 'tunnel' && <img src={currentTheme.tunnel} alt="Tunnel" />}
                  {block === 'free1' && <img src={currentTheme.free1} alt="Free Space 1" />}
                  {block === 'free2' && <img src={currentTheme.free2} alt="Free Space 2" />}
                  {block === 'free3' && <img src={currentTheme.free3} alt="Free Space 3" />}



                  {/* Farmer Character with Name */}
                  {farmerPosition?.row === rowIndex && farmerPosition?.col === colIndex && (
                    <>
                      <div className="character-label">{farmerName} (Farmer)</div>
                      <img
                        src={farmerImage}
                        alt="farmer"
                        className="character-image"
                      />
                    </>
                  )}

                  {/* Thief Character with Name */}
                  {thiefPosition?.row === rowIndex && thiefPosition?.col === colIndex && (
                    <>
                      <div className="character-label">{thiefName} (Thief)</div>
                      <img
                        src={thiefImage}
                        alt="thief"
                        className="character-image"
                      />
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameBoard;
