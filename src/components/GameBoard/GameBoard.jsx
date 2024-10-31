import React from 'react';
import './GameBoard.css';

const GameBoard = ({ grid, farmerPosition, thiefPosition, thiefImage, farmerImage, farmerName, thiefName }) => {
  return (
    <div className="gameboard-container">
      <table className="game-table">
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((block, colIndex) => (
                <td key={colIndex} className={`table-cell ${block}`}>
                  {block === 'obstacle' && ' '}
                  {block === 'tunnel' && ' '}
                  {block.startsWith('free') && ' '}

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
