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

// Socket
import { setupSocketHandlers } from './socket/socketHandler';

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

// Express App
const app: Application = express();
const httpServer = createServer(app);

// ======================
// CORS Configuration
// ======================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://65.2.189.126',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://[::1]:5173'
].filter(Boolean) as string[];

const isDevOriginAllowed = (origin: string) =>
  process.env.NODE_ENV !== 'production' &&
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin) || isDevOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
};

// Express Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isDevOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ======================
// Routes
// ======================

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

// Socket Handlers
setupSocketHandlers(io);

// Controllers
setNotificationIO(io);
setAchievementIO(io);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export { io };