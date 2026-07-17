import api from './api';

export const notificationService = {
  // Get notifications
  getNotifications: async (unread = false, limit = 20, skip = 0) => {
    const response = await api.get('/notifications', {
      params: { unread, limit, skip }
    });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications?unread=true&limit=1');
    return response.data.unreadCount || 0;
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Clear all
  clearAllNotifications: async () => {
    const response = await api.delete('/notifications');
    return response.data;
  }
};
