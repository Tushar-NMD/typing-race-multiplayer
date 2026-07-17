import api from './api';

export const matchService = {
  // Get user's match history
  getUserHistory: async (limit = 10, skip = 0) => {
    const response = await api.get('/matches/history', {
      params: { limit, skip }
    });
    return response.data;
  },

  // Get match details
  getMatchDetails: async (matchId) => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/matches/stats/me');
    return response.data;
  },

  // Get global leaderboard
  getLeaderboard: async (period = 'all', limit = 20) => {
    const response = await api.get('/matches/leaderboard', {
      params: { period, limit }
    });
    return response.data;
  },

  // Get friend leaderboard
  getFriendLeaderboard: async () => {
    const response = await api.get('/matches/leaderboard/friends');
    return response.data;
  }
};
