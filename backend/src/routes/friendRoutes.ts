import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriends,
  removeFriend,
  searchUsers,
  getFriendSuggestions,
  blockUser,
  unblockUser
} from '../controllers/friendController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All friend routes require authentication
router.use(protect);

// Friend requests
router.post('/request/:userId', sendFriendRequest);
router.put('/request/:requestId/accept', acceptFriendRequest);
router.put('/request/:requestId/reject', rejectFriendRequest);
router.get('/requests/pending', getPendingRequests);

// Friends list
router.get('/', getFriends);
router.delete('/:friendId', removeFriend);

// Search and suggestions
router.get('/search', searchUsers);
router.get('/suggestions', getFriendSuggestions);

// Block/Unblock
router.post('/block/:userId', blockUser);
router.delete('/block/:userId', unblockUser);

export default router;
