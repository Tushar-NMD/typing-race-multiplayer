import express from 'express';
import { generatePrompt, generateCoachFeedback } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/prompt', protect, generatePrompt);
router.post('/coach', protect, generateCoachFeedback);

export default router;
