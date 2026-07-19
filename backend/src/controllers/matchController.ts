import { Response } from 'express';
import Match from '../models/Match';
import Result from '../models/Result';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// @desc    Get user's match history
// @route   GET /api/matches/history
// @access  Private
export const getUserMatchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { limit = 10, skip = 0 } = req.query;

    // Get all matches where user participated
    const results = await Result.find({ userId })
      .populate({
        path: 'matchId',
        populate: {
          path: 'winner',
          select: 'username'
        }
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Result.countDocuments({ userId });

    res.json({
      success: true,
      data: results,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save practice match result
// @route   POST /api/matches/practice
// @access  Private
export const savePracticeResult = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { wpm, accuracy, mistakes } = req.body;

    const result = await Result.create({
      userId,
      wpm,
      accuracy,
      mistakes,
      position: 1 // For practice, position is always 1
    });

    // Update user stats
    const user = await User.findById(userId);
    if (user) {
      user.gamesPlayed += 1;
      user.wins += 1; // Practice counts as a win? Sure, why not, or maybe don't touch wins
      user.highestWPM = Math.max(user.highestWPM || 0, wpm);
      
      // Calculate new moving averages roughly
      if (!user.averageWPM) user.averageWPM = wpm;
      else user.averageWPM = Math.round((user.averageWPM * (user.gamesPlayed - 1) + wpm) / user.gamesPlayed);
      
      if (!user.accuracy) user.accuracy = accuracy;
      else user.accuracy = Math.round((user.accuracy * (user.gamesPlayed - 1) + accuracy) / user.gamesPlayed);

      await user.save();
    }

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get match details with all players
// @route   GET /api/matches/:matchId
// @access  Private
export const getMatchDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate('winner', 'username')
      .populate('players', 'username');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Get all results for this match sorted by position
    const results = await Result.find({ matchId })
      .populate('userId', 'username')
      .sort({ position: 1 });

    res.json({
      success: true,
      data: {
        match,
        results
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/matches/stats/me
// @access  Private
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get total matches and wins
    const totalMatches = await Result.countDocuments({ userId });
    const wins = await Result.countDocuments({ userId, position: 1 });

    // Get average stats
    const results = await Result.find({ userId });
    const avgWpm = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length)
      : 0;

    const avgAccuracy = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
      : 0;

    res.json({
      success: true,
      data: {
        gamesPlayed: user.gamesPlayed,
        wins: user.wins,
        highestWPM: user.highestWPM,
        averageWPM: user.averageWPM,
        accuracy: user.accuracy,
        winRate: user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0,
        totalMatches,
        avgAccuracy
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get global leaderboard
// @route   GET /api/matches/leaderboard
// @access  Public
export const getLeaderboard = async (req: any, res: Response) => {
  try {
    const { period = 'all', limit = 20 } = req.query;

    let dateFilter = {};
    const now = new Date();

    // Filter by period
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    // Get top players by WPM
    const leaderboard = await Result.find(dateFilter)
      .populate('userId', 'username avatar')
      .sort({ wpm: -1 })
      .limit(Number(limit))
      .exec();

    // Group by user and calculate stats
    const playerStats = new Map();
    leaderboard.forEach((result: any) => {
      if (!result.userId) return; // Skip results where the user has been deleted

      const userId = (result.userId as any)._id.toString();
      if (!playerStats.has(userId)) {
        playerStats.set(userId, {
          userId: (result.userId as any)._id,
          username: (result.userId as any).username,
          avatar: (result.userId as any).avatar,
          games: 0,
          wins: 0,
          totalWpm: 0,
          totalAccuracy: 0,
          bestWpm: 0
        });
      }

      const stats = playerStats.get(userId);
      stats.games += 1;
      if (result.position === 1) stats.wins += 1;
      stats.totalWpm += result.wpm;
      stats.totalAccuracy += result.accuracy;
      stats.bestWpm = Math.max(stats.bestWpm, result.wpm);
    });

    // Calculate averages and sort
    const sorted = Array.from(playerStats.values())
      .map(stat => ({
        ...stat,
        avgWpm: Math.round(stat.totalWpm / stat.games),
        avgAccuracy: Math.round(stat.totalAccuracy / stat.games),
        winRate: Math.round((stat.wins / stat.games) * 100)
      }))
      .sort((a, b) => b.avgWpm - a.avgWpm);

    res.json({
      success: true,
      period,
      data: sorted
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get friend leaderboard
// @route   GET /api/matches/leaderboard/friends
// @access  Private
export const getFriendLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get friends list
    const friendIds = user.friends || [];
    if (userId) {
      friendIds.push(userId); // Include self
    }

    // Get stats for user and friends
    const results = await Result.find({ userId: { $in: friendIds } })
      .populate('userId', 'username avatar')
      .exec();

    const playerStats = new Map();
    results.forEach((result: any) => {
      const userId = (result.userId as any)._id.toString();
      if (!playerStats.has(userId)) {
        playerStats.set(userId, {
          userId: (result.userId as any)._id,
          username: (result.userId as any).username,
          avatar: (result.userId as any).avatar,
          games: 0,
          wins: 0,
          totalWpm: 0,
          totalAccuracy: 0,
          bestWpm: 0
        });
      }

      const stats = playerStats.get(userId);
      stats.games += 1;
      if (result.position === 1) stats.wins += 1;
      stats.totalWpm += result.wpm;
      stats.totalAccuracy += result.accuracy;
      stats.bestWpm = Math.max(stats.bestWpm, result.wpm);
    });

    const sorted = Array.from(playerStats.values())
      .map(stat => ({
        ...stat,
        avgWpm: Math.round(stat.totalWpm / stat.games),
        avgAccuracy: Math.round(stat.totalAccuracy / stat.games),
        winRate: Math.round((stat.wins / stat.games) * 100)
      }))
      .sort((a, b) => b.avgWpm - a.avgWpm);

    res.json({
      success: true,
      data: sorted
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
