made with love by flingz; a detail; many more fun apps to come, hope you liked this. Here's a readme to help you understand this word-puzzle treasure app:

# Treasure Hunt Frontend

## Overview

**Treasure Hunt** is an interactive, blockchain-based game built on the **Seismic Chain Devnet**, where players can hunt for virtual treasures, solve riddles, and earn points. The app is designed as a pirate-themed adventure, complete with a wooden aesthetic, parchment-style UI, and background music to immerse players in the experience. Players connect their Ethereum-compatible wallets (e.g., MetaMask or Rabby), link their Discord accounts for chat functionality, and compete on a leaderboard to become the top treasure hunter.

The game leverages **smart contracts** deployed on the Seismic Chain Devnet to manage treasures, points, and player interactions. The frontend is built with **React** and uses **Material-UI** for styling, providing a visually appealing and functional interface. The app also integrates with a backend API for Discord authentication and real-time chat functionality.

## Features

- **Wallet Integration**:
  - Connect with MetaMask or Rabby to interact with the Seismic Chain Devnet.
  - Automatically switches to the Seismic Chain Devnet (Chain ID: 5124) or adds it to the wallet if not present.
  - Displays the player's points and claimed treasures.

- **Treasure Hunting**:
  - View a list of active treasures with clues (hashed on-chain), hints, and point values.
  - Submit solutions to claim treasures and earn points.
  - See a history of claimed treasures, including the claimant and points awarded.

- **Leaderboard**:
  - Displays a paginated leaderboard of all players, sorted by points.
  - Shows each player's Discord username (if linked), points, and number of treasures claimed.

- **Real-Time Chat**:
  - Players can chat with each other in a "Crew Chat" section.
  - Chat messages are fetched from the backend API and updated every 10 seconds.
  - Requires Discord linking to participate in the chat.

- **Admin Features** (for the deployer):
  - Add new treasures with a clue, points, and hint.
  - Update hints for existing treasures.
  - Unlink Discord accounts from player addresses.

- **Discord Integration**:
  - Link your Discord account to display your username in the leaderboard and chat.
  - Uses OAuth2 for secure Discord authentication via the backend API.

- **Theming and Audio**:
  - Pirate-themed UI with a wooden background, parchment-style paper, and gold text.
  - Background music (`Irish_Rovers.mp3`) with play/pause and mute controls.
  - A spinning treasure chest animation for visual flair.

- **Start Screen**:
  - A "Start Game" button on first load to initiate the game and play the background music.

## How It Works

1. **Connect Wallet**:
   - Players connect their wallet (MetaMask or Rabby) to the app.
   - The app ensures the wallet is on the Seismic Chain Devnet (Chain ID: 5124). If not, it prompts the user to switch or adds the network.

2. **Link Discord**:
   - Players can link their Discord account to display their username in the leaderboard and participate in the chat.
   - Discord linking uses OAuth2, redirecting to Discord for authentication and then back to the app.

3. **Hunt for Treasures**:
   - The app fetches a list of treasures from the smart contract.
   - Each treasure has a clue (hashed on-chain), a hint, and a point value.
   - Players submit a solution to claim a treasure. If correct, they earn the points, and the treasure is marked as claimed.

4. **Compete on the Leaderboard**:
   - The leaderboard shows all players, their points, and the number of treasures they’ve claimed.
   - Players are identified by their Discord username (if linked) or a truncated wallet address.

5. **Chat with the Crew**:
   - Players can send and receive messages in the "Crew Chat" section.
   - Messages are stored and retrieved via the backend API.

6. **Admin Actions** (Deployer Only):
   - The deployer (specified by `DEPLOYER_ADDRESS`) can add new treasures, update hints, and unlink Discord accounts.

## Tech Stack

- **Frontend**:
  - **React**: JavaScript library for building the user interface.
  - **Material-UI**: For styled components and responsive design elements.
  - **Ethers.js**: For interacting with the Ethereum blockchain and smart contracts.

- **Blockchain**:
  - **Seismic Chain Devnet**: A test network for deploying and testing smart contracts (Chain ID: 5124, RPC URL: `https://node-2.seismicdev.net/rpc`).
  - **Smart Contract**: Written in Solidity, deployed on the Seismic Chain Devnet, and interacted with via the ABI.

- **Backend**:
  - A custom backend API (deployed at `https://treasure-hunt-frontend-livid.vercel.app`) for Discord authentication and chat functionality.
  - Endpoints:
    - `/discord/:address`: Fetch Discord ID for a given wallet address.
    - `/discord/callback`: Handle Discord OAuth2 callback.
    - `/discord/forgive`: Unlink a Discord account (admin only).
    - `/api/chat`: Fetch and post chat messages.

- **Styling**:
  - Custom pirate-themed styling with wooden textures, parchment backgrounds, and gold text.
  - Fonts: `'Pirata One', cursive` for a pirate aesthetic.

- **Audio**:
  - Background music (`Irish_Rovers.mp3`) stored in the `/audio` directory.

## Prerequisites

To run this project locally, you’ll need:

- **Node.js** and **npm**: For running the React app and managing dependencies.
- **MetaMask or Rabby**: An Ethereum-compatible wallet for interacting with the app.
- **Git**: For cloning the repository.
- **A GitHub Account**: For accessing the repository.
- **Vercel Account** (optional): For deploying the app.

## Setup Instructions

### 1. Clone the Repository
Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/treasure-hunt-frontend.git
cd treasure-hunt-frontend
