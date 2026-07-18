import express from 'express';
import {
  getUserMatchHistory,
  getMatchDetails,
  getUserStats,
  getLeaderboard,
  getFriendLeaderboard,
  savePracticeResult
} from '../controllers/matchController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Routes with specific paths first (to prevent /:matchId from catching them)
router.post('/practice', protect, savePracticeResult);
router.get('/history', protect, getUserMatchHistory);
router.get('/stats/me', protect, getUserStats);
router.get('/leaderboard/friends', protect, getFriendLeaderboard);
router.get('/leaderboard', getLeaderboard);

// Catch-all route for specific match ID (must be last)
router.get('/:matchId', protect, getMatchDetails);

export default router;
