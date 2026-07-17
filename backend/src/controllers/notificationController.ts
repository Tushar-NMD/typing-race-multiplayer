import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { Server } from 'socket.io';

export let ioInstance: Server;

export const setIO = (io: Server) => {
  ioInstance = io;
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { unread = false, limit = 20, skip = 0 } = req.query;

    let query: any = { userId };

    if (unread === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:notificationId/read
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Marked as read',
      data: notification
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All marked as read'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await Notification.deleteOne({ _id: notificationId });

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
export const clearAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    await Notification.deleteMany({ userId });

    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to create and send notification
export const createNotification = async (
  userId: string,
  type: 'friend_request' | 'friend_accepted' | 'game_result' | 'achievement' | 'invite',
  title: string,
  message: string,
  data: Record<string, any> = {}
) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data
    });

    // Emit via Socket.IO in real-time
    if (ioInstance) {
      ioInstance.to(userId).emit('notification', {
        _id: notification._id,
        type,
        title,
        message,
        data,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
