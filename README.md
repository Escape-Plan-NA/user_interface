Random game

Random game

Game start

# 🏃💨 Escape Plan

**Welcome to Escape Plan** – a thrilling two-player game of wits and strategy! One player takes on the role of the **Warder**, while the other becomes the **Prisoner**. Can you escape to freedom or capture the fugitive? Only time (and strategy) will tell.

🌍 **Hello!** 
We're love Salad and We're Salad group

---

## 🚀 Project Overview
Escape Plan is a client-server game that lets two players connect, strategize, and compete for the win. One computer hosts the **server** and a **game client**, while the other is a standalone **game client** that connects to the server. Each player must move their character wisely within the time limit and aim to outsmart their opponent. 

### Key Features

- **Multiplayer Setup**: Host a server and connect two clients to play.
- **Role Assignment**: Each game, players are randomly assigned the roles of **Warder** or **Prisoner**.
- **Win Conditions**:
  - **Warder** wins by catching the **Prisoner**.
  - **Prisoner** wins by reaching the **tunnel** block.
- **Score Tracking**: Server keeps track of scores and displays the winner's name and current score after each game.
- **Server Controls**: Admin can reset the game and player scores at any time.
- **Map Randomization**: The server shuffles the map and assigns characters for each game to keep it exciting.

---

## 🕹️ Game Mechanics

1. **Connecting to the Server**:
   - Clients connect to the server and retrieve information about other players.
   - The server's IP and port are predefined in the source code.

2. **Set your names and Character(s)**:
   - Set your nickname at the start, and receive a friendly welcome message.

3. **Gameplay**:
   - Players move to adjacent blocks only.
   - Obstacles are non-accessible, adding complexity to the strategy.
   - **Warder** cannot enter the tunnel block.
   - Each turn has a **10-second timer** to keep the game pace exciting.

4. **Win Scenarios**:
   - **Warder catches the Prisoner** to win.
   - **Prisoner reaches the tunnel** to win.
   - The winner becomes the first player for the next game!

---

## 🔧 Server Capabilities

- **Real-Time Player Count**: Displays the number of connected players.
- **Score Reset**: Admin can reset scores and the game at any point.
- **Randomized Game Elements**: Randomly assigns characters and map layout at the start of each game.

---

## 📝 How to Play

1. **Launch the Server**: Start the server on one computer, which also doubles as a client.
2. **Connect the Client**: On a second computer, connect another client to join the game.
3. **Set Your Nickname**: Choose your unique nickname to make your mark!
4. **Play Smart & Fast**: Each turn allows only 10 seconds to move – stay focused!
5. **Win and Play Again**: Each game updates the scoreboard, and the winner takes the first turn in the next round.

---

## 🛠️ Installation & Setup
 **Clone the Repository**:
   git clone https://github.com/YourUsername/EscapePlan.git
  

---

## 💡 Tech Infomations
- **Client-Server Architecture**: Allows multi-client connectivity with real-time updates.
- **Socket Programming**: Enables player interactions through network communication.

---

## 🏆 Contributing

Got ideas to make Escape Plan even better? We welcome contributions! Check out our [Contribution Guidelines](./CONTRIBUTING.md) for more details.

---


**Escape Plan** – Play your role, strategize your moves, and wish you win in our game krub/ka!
