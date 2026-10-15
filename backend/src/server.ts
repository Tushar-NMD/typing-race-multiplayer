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

// Express App
const app: Application = express();
const httpServer = createServer(app);

// ======================
// CORS Configuration
// ======================

const parseOrigins = (value?: string): string[] =>
  value
    ?.split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean) ?? [];

const allowedOrigins = [
  'https://typing-race-multiplayer.vercel.app',
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.CORS_ORIGINS),
].filter((origin, index, origins) => origins.indexOf(origin) === index);

// Allow localhost only during development
const isDevOriginAllowed = (origin: string): boolean =>
  process.env.NODE_ENV !== 'production' &&
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);

// Allow the main Vercel domain and preview deployments for this project
const isVercelOriginAllowed = (origin: string): boolean =>
  /^https:\/\/typing-race-multiplayer(?:-[a-z0-9-]+)?\.vercel\.app$/.test(
    origin
  );

const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true;

  const normalizedOrigin = origin.trim().replace(/\/+$/, '');

  return (
    allowedOrigins.includes(normalizedOrigin) ||
    isVercelOriginAllowed(normalizedOrigin) ||
    isDevOriginAllowed(normalizedOrigin)
  );
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.error('CORS rejected origin:', origin);
      callback(new Error(`CORS not allowed: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ======================
// Express Middleware
// ======================

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// Socket.IO
// ======================

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.error('Socket.IO CORS rejected origin:', origin);
        callback(new Error(`CORS not allowed: ${origin}`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ======================
// Routes
// ======================

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Typeverse API is running',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/ai', aiRoutes);

// ======================
// Socket Handlers
// ======================

setupSocketHandlers(io);

setNotificationIO(io);
setAchievementIO(io);

// ======================
// Error Middleware
// ======================

app.use(notFound);
app.use(errorHandler);

// ======================
// Start Server
// ======================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log('✅ Allowed origins:', allowedOrigins);
});

export { io };