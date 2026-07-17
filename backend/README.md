# Typeverse Backend API

Backend server for Typeverse typing application built with Express, TypeScript, MongoDB, and Socket.IO.

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Setup

### Prerequisites
- Node.js 18+
- MongoDB installed and running locally or MongoDB Atlas account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/typeverse
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Start MongoDB (if local):
```bash
mongod
```

5. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |

### Rooms

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/rooms` | Create room | Private |
| GET | `/api/rooms` | Get public rooms | Public |
| GET | `/api/rooms/:roomCode` | Get room details | Public |
| POST | `/api/rooms/:roomCode/join` | Join room | Private |
| POST | `/api/rooms/:roomCode/leave` | Leave room | Private |
| DELETE | `/api/rooms/:roomCode` | Delete room | Private |

## Database Models

### User
```typescript
{
  name: string
  username: string (unique)
  email: string (unique)
  password: string (hashed)
  avatar?: string
  highestWPM: number
  averageWPM: number
  accuracy: number
  gamesPlayed: number
  wins: number
  friends: ObjectId[]
  createdAt: Date
}
```

### Room
```typescript
{
  roomCode: string (unique)
  hostId: ObjectId
  players: [{
    userId: ObjectId
    username: string
    ready: boolean
  }]
  status: 'waiting' | 'countdown' | 'playing' | 'finished'
  language: string
  duration: number
  maxPlayers: number (2-8)
  isPrivate: boolean
  password?: string
  createdAt: Date
}
```

### Match
```typescript
{
  roomId: ObjectId
  players: ObjectId[]
  winner: ObjectId
  paragraph: string
  duration: number
  createdAt: Date
}
```

### Result
```typescript
{
  userId: ObjectId
  matchId: ObjectId
  wpm: number
  accuracy: number
  mistakes: number
  position: number
  createdAt: Date
}
```

## Testing with Postman/Bruno

### 1. Register User
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Get Current User (Protected)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4. Create Room (Protected)
```
POST http://localhost:5000/api/rooms
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "maxPlayers": 4,
  "duration": 60,
  "language": "english",
  "isPrivate": false
}
```

### 5. Get Public Rooms
```
GET http://localhost:5000/api/rooms
```

### 6. Join Room (Protected)
```
POST http://localhost:5000/api/rooms/ABC123/join
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "password": "" // if private room
}
```

## Socket.IO Events (Coming in Phase 5)

Will include:
- `connection` - User connects
- `disconnect` - User disconnects
- `joinRoom` - Join a room
- `leaveRoom` - Leave a room
- `ready` - Player ready state
- `startGame` - Host starts game
- `typing` - Real-time typing progress
- `finish` - Player finishes typing

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts         # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts   # Auth logic
│   │   └── roomController.ts   # Room logic
│   ├── middleware/
│   │   ├── auth.ts             # JWT middleware
│   │   └── errorHandler.ts    # Error handling
│   ├── models/
│   │   ├── User.ts             # User schema
│   │   ├── Room.ts             # Room schema
│   │   ├── Match.ts            # Match schema
│   │   └── Result.ts           # Result schema
│   ├── routes/
│   │   ├── authRoutes.ts       # Auth routes
│   │   └── roomRoutes.ts       # Room routes
│   ├── utils/
│   │   ├── generateToken.ts    # JWT generator
│   │   └── generateRoomCode.ts # Room code generator
│   └── server.ts               # Entry point
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Next Steps

- [ ] Phase 3: Dashboard APIs
- [ ] Phase 4: Complete Room APIs
- [ ] Phase 5: Socket.IO Real-time features
- [ ] Phase 6: Waiting Room with Socket.IO
- [ ] Phase 7: Countdown functionality
- [ ] Phase 8: Real-time typing tracking
- [ ] Phase 9: Match results and leaderboard
- [ ] Phase 10: Match history
- [ ] Phase 11: Friends system
- [ ] Phase 12: Global leaderboard
- [ ] Phase 13: Notifications
- [ ] Phase 14: Deployment

## License

MIT
