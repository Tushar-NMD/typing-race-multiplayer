import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { connectDB } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import matchRoutes from './routes/matchRoutes';
import friendRoutes from './routes/friendRoutes';
import notificationRoutes from './routes/notificationRoutes';
import achievementRoutes from './routes/achievementRoutes';
import aiRoutes from './routes/aiRoutes';

// Controllers
import { setIO as setNotificationIO } from './controllers/notificationController';
import { setIO as setAchievementIO } from './controllers/achievementController';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow localhost on any port
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost on any port
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Typeverse API is running',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/ai', aiRoutes);

// Socket.IO handlers
import { setupSocketHandlers } from './socket/socketHandler';
setupSocketHandlers(io);

// Set IO instances for notifications and achievements
setNotificationIO(io);
setAchievementIO(io);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export { io };
