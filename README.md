# Warder and Prisoner Game

## Overview
**Warder and Prisoner** is a two-player strategic game where one player takes on the role of the **Warder** while the other is the **Prisoner**, competing on a dynamic 5x5 block map. The **Warder**'s goal is to capture the **Prisoner**, while the **Prisoner** aims to escape by reaching a tunnel. The game operates using a client-server architecture, with the server managing the game flow and handling multiple clients.

### Key Features:
- **5x5 Block Grid**: The map consists of randomly distributed **free**, **obstacle**, and **tunnel** blocks.
- **Character Roles**: Players are randomly assigned the role of **Warder** or **Prisoner** at the start of each game.
- **Turn-Based Gameplay**: Players take alternating turns, with a 10-second limit for each move.
- **Win Conditions**:
  - **Warder Victory**: The warder wins by reaching the prisoner's block.
  - **Prisoner Victory**: The prisoner wins by reaching the tunnel block.
- **Automatic Game Reset**: The server can reset the game board and player scores to restart the match.

## Extra Features: 
- **Single Player Mode**: Player can play with bot.
- **Chat**: The players can converse in the game through typing.

## Game Rules
1. **Map Configuration**:
   - The map consists of:
     - 19 **free** blocks that both players can access.
     - 5 **obstacle** blocks that neither player can cross.
     - 1 **tunnel** block, accessible only to the prisoner.

2. **Randomized Setup**: 
   - At the start of each game, the server randomly places the free, obstacle, and tunnel blocks, along with the starting positions of the characters.

3. **Turn-Based Movement**:
   - Each player has 10 seconds to move to an adjacent block (up, down, right, or left). If no move is made within the time limit, the turn is skipped.
   
4. **Win Conditions**:
   - **Warder Wins**: If the warder reaches the prisoner's location.
   - **Prisoner Wins**: If the prisoner reaches the tunnel block.

5. **Game Continuation**:
   - After a win, the server resets the game, and the winning player gets to start first in the next match. Player scores are tracked and displayed.

6. **Reset Feature**:
   - The server includes a reset button that allows the administrator to restart the game and reset player scores at any time

## Server Specifications
- **Hardcoded Server Address**: The server’s IP address and port are predefined in the source code, simplifying the connection process for clients.
- **Concurrent Clients**: The server monitors and displays the number of clients connected and active.
- **Game Reset**: Admins can reset the game map and player scores using a dedicated reset feature.

## Installation and Setup

### Prerequisites:
- **Java**: Ensure Java is installed on your machine, as the game is developed using Java.

### Steps to Run the Game:
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/warder-prisoner-game.git
   cd warder-prisoner-game
