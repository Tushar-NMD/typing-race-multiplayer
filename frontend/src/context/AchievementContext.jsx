import React, { createContext, useContext, useState, useEffect } from 'react';
import achievementService from '../services/achievementService';

const AchievementContext = createContext();

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};

export const AchievementProvider = ({ children }) => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  // Fetch user achievements on mount
  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await achievementService.getUserAchievements();
      
      if (response.data) {
        setAchievements(response.data);
        setUnlockedCount(response.stats?.completed || 0);
        setTotalPoints(response.stats?.totalPoints || 0);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await achievementService.getAchievementStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getAchievementProgress = (type) => {
    const achievement = achievements.find(a => a.achievementType === type);
    if (!achievement) return null;
    
    return {
      ...achievement,
      progressPercent: Math.round((achievement.progress / achievement.target) * 100)
    };
  };

  const getCompletedAchievements = () => {
    return achievements.filter(a => a.completed);
  };

  const getUnlockedBadges = () => {
    return achievements
      .filter(a => a.completed)
      .map(a => ({
        badge: a.badge,
        name: a.name,
        description: a.description,
        points: a.points
      }));
  };

  const value = {
    achievements,
    stats,
    loading,
    unlockedCount,
    totalPoints,
    fetchAchievements,
    fetchStats,
    getAchievementProgress,
    getCompletedAchievements,
    getUnlockedBadges
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};
