import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getUserAchievements,
  getAchievementById,
  getAchievementLeaderboard,
  getAchievementStats
} from '../controllers/achievementController';

const router = Router();

// Get authenticated user's achievements
router.get('/', protect, getUserAchievements);

// Get specific achievement by ID
router.get('/:achievementId', protect, getAchievementById);

// Get achievement leaderboard (top users by points)
router.get('/leaderboard/top', getAchievementLeaderboard);

// Get global achievement statistics
router.get('/stats/global', getAchievementStats);

export default router;
