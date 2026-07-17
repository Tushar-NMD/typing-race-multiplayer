import api from './api';

const achievementService = {
  // Get user's achievements
  getUserAchievements: async () => {
    try {
      const response = await api.get('/achievements');
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },

  // Get specific achievement
  getAchievementById: async (achievementId) => {
    try {
      const response = await api.get(`/achievements/${achievementId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievement:', error);
      throw error;
    }
  },

  // Get achievement leaderboard
  getAchievementLeaderboard: async (limit = 20) => {
    try {
      const response = await api.get(`/achievements/leaderboard/top?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievement leaderboard:', error);
      throw error;
    }
  },

  // Get global achievement stats
  getAchievementStats: async () => {
    try {
      const response = await api.get('/achievements/stats/global');
      return response.data;
    } catch (error) {
      console.error('Error fetching achievement stats:', error);
      throw error;
    }
  }
};

export default achievementService;
