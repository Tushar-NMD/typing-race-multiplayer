import api from './api';

export const friendService = {
  // Send friend request
  sendFriendRequest: async (userId) => {
    const response = await api.post(`/friends/request/${userId}`);
    return response.data;
  },

  // Accept friend request
  acceptFriendRequest: async (requestId) => {
    const response = await api.put(`/friends/request/${requestId}/accept`);
    return response.data;
  },

  // Reject friend request
  rejectFriendRequest: async (requestId) => {
    const response = await api.put(`/friends/request/${requestId}/reject`);
    return response.data;
  },

  // Get pending friend requests
  getPendingRequests: async () => {
    const response = await api.get('/friends/requests/pending');
    return response.data;
  },

  // Get friends list
  getFriends: async () => {
    const response = await api.get('/friends');
    return response.data;
  },

  // Remove friend
  removeFriend: async (friendId) => {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  },

  // Search users
  searchUsers: async (query) => {
    const response = await api.get('/friends/search', {
      params: { query }
    });
    return response.data;
  },

  // Get friend suggestions
  getFriendSuggestions: async () => {
    const response = await api.get('/friends/suggestions');
    return response.data;
  },

  // Block user
  blockUser: async (userId) => {
    const response = await api.post(`/friends/block/${userId}`);
    return response.data;
  },

  // Unblock user
  unblockUser: async (userId) => {
    const response = await api.delete(`/friends/block/${userId}`);
    return response.data;
  }
};
