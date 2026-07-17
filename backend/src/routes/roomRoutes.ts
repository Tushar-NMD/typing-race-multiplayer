import express from 'express';
import { 
  createRoom, 
  getRoom, 
  getPublicRooms, 
  joinRoom, 
  leaveRoom, 
  deleteRoom 
} from '../controllers/roomController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getPublicRooms);
router.get('/:roomCode', getRoom);

// Protected routes
router.post('/', protect, createRoom);
router.post('/:roomCode/join', protect, joinRoom);
router.post('/:roomCode/leave', protect, leaveRoom);
router.delete('/:roomCode', protect, deleteRoom);

export default router;
