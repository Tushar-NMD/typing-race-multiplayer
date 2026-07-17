import { Response } from 'express';
import User from '../models/User';
import FriendRequest from '../models/FriendRequest';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';
import { updateSocialAchievement } from './achievementController';

// @desc    Send friend request
// @route   POST /api/friends/request/:userId
// @access  Private
export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?._id;
    const { userId } = req.params;

    // Validate user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Can't send request to yourself
    if (senderId?.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender?.friends.some(id => id.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already friends with this user'
      });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: senderId, to: userId, status: 'pending' },
        { from: userId, to: senderId, status: 'pending' }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already exists'
      });
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      from: senderId as any,
      to: userId as any,
      status: 'pending'
    });

    // Create notification for recipient
    await createNotification(
      userId as string,
      'friend_request',
      'New Friend Request',
      `${sender?.username} sent you a friend request`,
      { from: senderId, username: sender?.username }
    );

    res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data: friendRequest
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept friend request
// @route   PUT /api/friends/request/:requestId/accept
// @access  Private
export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Only recipient can accept
    if (friendRequest.to.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request'
      });
    }

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Get sender info
    const senderUser = await User.findById(friendRequest.from);

    // Add friends to both users
    const result1 = await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendRequest.from }
    }, { new: true });

    const result2 = await User.findByIdAndUpdate(friendRequest.from, {
      $addToSet: { friends: userId }
    }, { new: true });

    // Update social achievements for both users
    if (result1) {
      await updateSocialAchievement(userId.toString(), (result1?.friends?.length || 0));
    }
    if (result2) {
      await updateSocialAchievement(friendRequest.from.toString(), (result2?.friends?.length || 0));
    }

    // Create notification for sender
    await createNotification(
      friendRequest.from.toString(),
      'friend_accepted',
      'Friend Request Accepted',
      `${req.user?.username} accepted your friend request`,
      { userId, username: req.user?.username }
    );

    res.json({
      success: true,
      message: 'Friend request accepted',
      data: friendRequest
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject friend request
// @route   PUT /api/friends/request/:requestId/reject
// @access  Private
export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Only recipient can reject
    if (friendRequest.to.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }

    // Update request status
    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json({
      success: true,
      message: 'Friend request rejected',
      data: friendRequest
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests/pending
// @access  Private
export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const requests = await FriendRequest.find({
      to: userId,
      status: 'pending'
    })
      .populate('from', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's friends list
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId).populate('friends', 'username avatar highestWPM averageWPM');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.friends
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:friendId
// @access  Private
export const removeFriend = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { friendId } = req.params;

    // Remove from both users
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    res.json({
      success: true,
      message: 'Friend removed'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search for users to add as friends
// @route   GET /api/friends/search?query=username
// @access  Private
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    // Find users matching query, exclude self and current friends
    const user = await User.findById(userId);
    const currentFriends = user?.friends || [];

    const results = await User.find(
      {
        $and: [
          { _id: { $ne: userId } },
          { _id: { $nin: currentFriends } },
          {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { name: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      } as any,
      'username name avatar highestWPM averageWPM'
    ).limit(10);

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get friend suggestions based on WPM range
// @route   GET /api/friends/suggestions
// @access  Private
export const getFriendSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentFriends = user.friends || [];
    const userWPM = user.averageWPM || 0;
    const wpmRange = 20; // Suggest users within +/- 20 WPM

    // Find users with similar WPM, exclude self and friends
    const suggestions = await User.find(
      {
        _id: { $ne: userId, $nin: currentFriends },
        averageWPM: { $gte: userWPM - wpmRange, $lte: userWPM + wpmRange }
      },
      'username avatar averageWPM highestWPM gamesPlayed'
    )
      .sort({ averageWPM: -1 })
      .limit(5);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block a user
// @route   POST /api/friends/block/:userId
// @access  Private
export const blockUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { userId: blockedUserId } = req.params;

    // Can't block yourself
    if (userId?.toString() === blockedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself'
      });
    }

    // Add to blocked list (using a custom field)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: blockedUserId }
    });

    // Remove from friends if they are friends
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: blockedUserId }
    });

    await User.findByIdAndUpdate(blockedUserId, {
      $pull: { friends: userId }
    });

    res.json({
      success: true,
      message: 'User blocked'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unblock a user
// @route   DELETE /api/friends/block/:userId
// @access  Private
export const unblockUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { userId: blockedUserId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: blockedUserId }
    });

    res.json({
      success: true,
      message: 'User unblocked'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
