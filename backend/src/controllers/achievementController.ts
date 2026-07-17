import { Request, Response } from 'express';
import Achievement from '../models/Achievement';
import User from '../models/User';
import Notification from '../models/Notification';
import { Server } from 'socket.io';

export let ioInstance: Server;

export const setIO = (io: Server) => {
  ioInstance = io;
};

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = {
  speed_demon: {
    name: 'Speed Demon',
    description: 'Reach 100 WPM in a single game',
    badge: '🚀',
    points: 50,
    target: 1
  },
  accuracy_master: {
    name: 'Accuracy Master',
    description: 'Achieve 98% accuracy',
    badge: '🎯',
    points: 40,
    target: 1
  },
  win_streak: {
    name: 'Win Streak',
    description: 'Win 5 consecutive games',
    badge: '🔥',
    points: 100,
    target: 5
  },
  first_victory: {
    name: 'First Victory',
    description: 'Win your first multiplayer match',
    badge: '🏆',
    points: 25,
    target: 1
  },
  typing_machine: {
    name: 'Typing Machine',
    description: 'Play 50 games',
    badge: '⌨️',
    points: 75,
    target: 50
  },
  consistent_performer: {
    name: 'Consistent Performer',
    description: 'Maintain 90% average accuracy over 10 games',
    badge: '📊',
    points: 60,
    target: 10
  },
  social_butterfly: {
    name: 'Social Butterfly',
    description: 'Make 10 friends',
    badge: '🦋',
    points: 45,
    target: 10
  },
  speed_racer: {
    name: 'Speed Racer',
    description: 'Reach 150 WPM in a single game',
    badge: '⚡',
    points: 80,
    target: 1
  },
  perfect_game: {
    name: 'Perfect Game',
    description: 'Achieve 100% accuracy in a game',
    badge: '✨',
    points: 150,
    target: 1
  },
  legendary_status: {
    name: 'Legendary Status',
    description: 'Earn 500 achievement points',
    badge: '👑',
    points: 200,
    target: 500
  }
};

// Helper: Create or update achievement
export const createNotification = async (userId: string, type: 'friend_request' | 'friend_accepted' | 'game_result' | 'achievement' | 'invite', title: string, message: string, data: any) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data
    });

    if (ioInstance) {
      ioInstance.to(userId).emit('notification', notification);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Initialize achievements for new user
export const initializeAchievements = async (userId: string) => {
  try {
    const existingAchievements = await Achievement.find({ userId });
    
    // Only initialize if user has no achievements yet
    if (existingAchievements.length === 0) {
      const achievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => ({
        userId,
        achievementType: type,
        name: def.name,
        description: def.description,
        badge: def.badge,
        points: def.points,
        target: def.target,
        progress: 0,
        completed: false
      }));

      await Achievement.insertMany(achievements);
    }
  } catch (error) {
    console.error('Error initializing achievements:', error);
  }
};

// Get user's achievements
export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    const achievements = await Achievement.find({ userId }).sort({ createdAt: -1 });
    const completedCount = achievements.filter(a => a.completed).length;
    const totalPoints = achievements.reduce((sum, a) => sum + (a.completed ? a.points : 0), 0);

    res.json({
      success: true,
      data: achievements,
      stats: {
        total: achievements.length,
        completed: completedCount,
        totalPoints,
        progress: Math.round((completedCount / achievements.length) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: (error as Error).message
    });
  }
};

// Get achievement by ID
export const getAchievementById = async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;
    
    const achievement = await Achievement.findById(achievementId);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching achievement',
      error: (error as Error).message
    });
  }
};

// Update achievement progress (called internally after game)
export const updateAchievementProgress = async (userId: string, stats: any) => {
  try {
    const achievements = await Achievement.find({ userId, completed: false });

    for (const achievement of achievements) {
      let progressUpdate = 0;
      let shouldComplete = false;

      switch (achievement.achievementType) {
        case 'speed_demon':
          if (stats.wpm >= 100) {
            progressUpdate = 1;
            shouldComplete = true;
          }
          break;

        case 'accuracy_master':
          if (stats.accuracy >= 98) {
            progressUpdate = 1;
            shouldComplete = true;
          }
          break;

        case 'first_victory':
          if (stats.isWin) {
            progressUpdate = 1;
            shouldComplete = true;
          }
          break;

        case 'typing_machine':
          progressUpdate = 1;
          if (achievement.progress + progressUpdate >= achievement.target) {
            shouldComplete = true;
          }
          break;

        case 'speed_racer':
          if (stats.wpm >= 150) {
            progressUpdate = 1;
            shouldComplete = true;
          }
          break;

        case 'perfect_game':
          if (stats.accuracy === 100) {
            progressUpdate = 1;
            shouldComplete = true;
          }
          break;
      }

      if (progressUpdate > 0) {
        const newProgress = achievement.progress + progressUpdate;
        
        await Achievement.findByIdAndUpdate(achievement._id, {
          progress: newProgress,
          completed: shouldComplete,
          completedAt: shouldComplete ? new Date() : null
        });

        if (shouldComplete) {
          // Send achievement notification
          await createNotification(
            userId,
            'achievement',
            `🎉 Achievement Unlocked: ${achievement.name}`,
            `${achievement.description}. You earned ${achievement.points} points!`,
            {
              achievementId: achievement._id,
              badge: achievement.badge,
              points: achievement.points,
              name: achievement.name
            }
          );

          // Update user's total achievement points
          const user = await User.findById(userId);
          if (user) {
            user.totalAchievementPoints = (user.totalAchievementPoints || 0) + achievement.points;
            await user.save();
          }
        }
      }
    }

    // Check for Legendary Status (500+ points)
    const user = await User.findById(userId);
    if (user && user.totalAchievementPoints >= 500) {
      const legendary = await Achievement.findOne({ userId, achievementType: 'legendary_status', completed: false });
      if (legendary) {
        await Achievement.findByIdAndUpdate(legendary._id, {
          completed: true,
          completedAt: new Date(),
          progress: user.totalAchievementPoints
        });

        await createNotification(
          userId,
          'achievement',
          '👑 Legendary Status Unlocked!',
          'You have earned 500+ achievement points. You are a legend!',
          {
            achievementId: legendary._id,
            badge: '👑',
            points: 200,
            totalPoints: user.totalAchievementPoints
          }
        );

        user.totalAchievementPoints += 200;
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error updating achievement progress:', error);
  }
};

// Update win streak
export const updateWinStreak = async (userId: string, isWin: boolean) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (isWin) {
      // Get recent wins (last 5 games)
      // For simplicity, track as: if win, increment streak
      // In production, you'd track this in a separate field or Match model
      
      const winStreak = await Achievement.findOne({ userId, achievementType: 'win_streak', completed: false });
      if (winStreak) {
        // This is simplified - in production, track actual consecutive wins
        const newProgress = winStreak.progress + 1;
        const shouldComplete = newProgress >= 5;

        await Achievement.findByIdAndUpdate(winStreak._id, {
          progress: newProgress,
          completed: shouldComplete,
          completedAt: shouldComplete ? new Date() : null
        });

        if (shouldComplete) {
          await createNotification(
            userId,
            'achievement',
            '🔥 Win Streak Achievement Unlocked!',
            'You won 5 consecutive games! Amazing performance!',
            {
              badge: '🔥',
              points: 100
            }
          );

          user.totalAchievementPoints += 100;
          await user.save();
        }
      }
    }
  } catch (error) {
    console.error('Error updating win streak:', error);
  }
};

// Update friend achievements
export const updateSocialAchievement = async (userId: string, friendCount: number) => {
  try {
    const achievement = await Achievement.findOne({ userId, achievementType: 'social_butterfly', completed: false });
    if (!achievement) return;

    const shouldComplete = friendCount >= 10;

    await Achievement.findByIdAndUpdate(achievement._id, {
      progress: friendCount,
      completed: shouldComplete,
      completedAt: shouldComplete ? new Date() : null
    });

    if (shouldComplete) {
      await createNotification(
        userId,
        'achievement',
        '🦋 Social Butterfly Achievement Unlocked!',
        'You have made 10 friends! You are very social!',
        {
          badge: '🦋',
          points: 45
        }
      );

      const user = await User.findById(userId);
      if (user) {
        user.totalAchievementPoints += 45;
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error updating social achievement:', error);
  }
};

// Get leaderboard by achievements
export const getAchievementLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const leaderboard = await User.find()
      .sort({ totalAchievementPoints: -1 })
      .limit(parseInt(limit as string))
      .select('username avatar totalAchievementPoints achievements');

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: (error as Error).message
    });
  }
};

// Get global achievement stats
export const getAchievementStats = async (req: Request, res: Response) => {
  try {
    const totalAchievements = await Achievement.countDocuments({ completed: true });
    const mostCommon = await Achievement.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$achievementType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const rarest = await Achievement.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$achievementType', count: { $sum: 1 } } },
      { $sort: { count: 1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalAchievements,
        mostCommon,
        rarest
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching achievement stats',
      error: (error as Error).message
    });
  }
};
