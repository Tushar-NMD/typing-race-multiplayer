import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);

// Mark as read
router.put('/:notificationId/read', markAsRead);
router.put('/read-all', markAllAsRead);

// Delete
router.delete('/:notificationId', deleteNotification);
router.delete('/', clearAllNotifications);

export default router;
