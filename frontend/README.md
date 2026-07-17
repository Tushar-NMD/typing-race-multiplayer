# Typeverse - Typing Speed Practice & Multiplayer Racing

A modern, feature-rich typing speed application built with React, Vite, and TailwindCSS.

## Features

### 🎯 Core Features
- **Landing Page** - Beautiful hero section with features and top players
- **User Authentication** - Login and Signup with Google OAuth support
- **Dashboard** - Personalized stats and quick actions
- **Practice Mode** - Solo typing practice with customizable settings
- **Multiplayer Mode** - Real-time typing races with friends
- **Leaderboard** - Global, weekly, monthly, and friends rankings
- **Profile Management** - View and edit user profile and achievements
- **Game History** - Track all your previous games
- **Friends System** - Add friends, send invites, and manage friend list
- **Settings** - Customize theme, font size, typing sound, and more

### 🎮 Game Modes
- **Practice Mode**
  - Difficulty levels: Easy, Medium, Hard
  - Time options: 15s, 30s, 60s, 120s
  - Multiple languages
  - Custom text support

- **Multiplayer Mode**
  - Create private rooms with password protection
  - Join public rooms
  - 2-8 players support
  - Real-time progress tracking
  - Waiting room with ready system
  - 3-2-1 countdown before race

### 📊 Statistics & Progress
- Words Per Minute (WPM) tracking
- Accuracy percentage
- Mistakes counter
- Games played and wins
- Personal best records
- Achievement system

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool
- **TailwindCSS 4** - Styling
- **React Router DOM** - Navigation
- **Lucide React** - Icons

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:5173
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run oxlint for code quality

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx          # Navigation component
│   ├── pages/
│   │   ├── Landing.jsx          # Home page
│   │   ├── Login.jsx            # Login page
│   │   ├── Signup.jsx           # Signup page
│   │   ├── Dashboard.jsx        # User dashboard
│   │   ├── Practice.jsx         # Practice mode setup
│   │   ├── PracticeGame.jsx     # Practice game screen
│   │   ├── Multiplayer.jsx      # Multiplayer lobby
│   │   ├── WaitingRoom.jsx      # Multiplayer waiting room
│   │   ├── MultiplayerGame.jsx  # Multiplayer game screen
│   │   ├── Leaderboard.jsx      # Rankings
│   │   ├── History.jsx          # Game history
│   │   ├── Profile.jsx          # User profile
│   │   ├── Friends.jsx          # Friends management
│   │   └── Settings.jsx         # App settings
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── package.json
└── vite.config.js
```

## Routes

- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - User dashboard (protected)
- `/practice` - Practice mode setup
- `/practice/game` - Practice game screen
- `/multiplayer` - Multiplayer lobby
- `/multiplayer/waiting` - Waiting room
- `/multiplayer/game` - Multiplayer game
- `/leaderboard` - Leaderboard
- `/history` - Game history
- `/profile` - User profile
- `/friends` - Friends management
- `/settings` - Settings

## Next Steps

### Backend Integration
To make this a fully functional app, you'll need to:

1. **Set up a backend server** (Node.js/Express, Python/Flask, etc.)
2. **Implement WebSocket** for real-time multiplayer using Socket.IO
3. **Add database** (MongoDB, PostgreSQL) for user data and game records
4. **Implement authentication** (JWT, OAuth)
5. **Create REST APIs** for:
   - User authentication
   - Profile management
   - Game history
   - Leaderboard data
   - Friends system

### Recommended Backend Structure
```
backend/
├── server.js              # Express server + Socket.IO
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management
│   ├── games.js          # Game data
│   └── leaderboard.js    # Rankings
├── models/
│   ├── User.js           # User schema
│   ├── Game.js           # Game schema
│   └── Friend.js         # Friend schema
└── socket/
    └── game.js           # Socket.IO game logic
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
