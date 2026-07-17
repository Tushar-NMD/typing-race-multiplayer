import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Room from '../models/Room';
import User from '../models/User';
import Match from '../models/Match';
import Result from '../models/Result';
import { updateAchievementProgress, updateWinStreak, updateSocialAchievement } from '../controllers/achievementController';

interface AuthSocket extends Socket {
  userId?: string;
  username?: string;
}

interface JoinRoomData {
  roomCode: string;
}

interface ReadyStatusData {
  roomCode: string;
  isReady: boolean;
}

interface TypingProgressData {
  roomCode: string;
  progress: number;
  wpm: number;
  accuracy: number;
}

interface GameCompleteData {
  roomCode: string;
  wpm: number;
  accuracy: number;
  timeTaken: number;
  paragraph?: string;
}

interface GameResult {
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  timeTaken: number;
  finishedAt: number;
  paragraph?: string;
}

// Store game results temporarily (in production, use Redis)
const gameResults = new Map<string, GameResult[]>();
// Track expected player count per room at game-start time
const expectedPlayers = new Map<string, number>();
// Track which rooms have already been saved to prevent double-saves
const savedRooms = new Set<string>();
// Track pending save timers
const saveTimers = new Map<string, NodeJS.Timeout>();

// Save match results to database
async function saveMatchResults(room: any, results: GameResult[]) {
  try {
    // Sort results by WPM (highest first)
    const sortedResults = results.sort((a, b) => b.wpm - a.wpm);
    
    // Get paragraph from first result (all players had same paragraph)
    const paragraph = sortedResults[0].paragraph || 'Game completed';
    
    // Create Match document
    const match = await Match.create({
      roomId: room._id,
      players: sortedResults.map(r => r.userId),
      winner: sortedResults[0].userId,
      paragraph,
      duration: room.duration
    });

    console.log(`💾 Match created: ${match._id}`);

    // Create Result documents for each player
    const resultDocs = await Promise.all(
      sortedResults.map((result, index) => 
        Result.create({
          userId: result.userId,
          matchId: match._id,
          wpm: result.wpm,
          accuracy: result.accuracy,
          mistakes: Math.round((100 - result.accuracy) * result.wpm / 100),
          position: index + 1
        })
      )
    );

    console.log(`💾 Created ${resultDocs.length} result records`);

    // Update user statistics and achievements
    for (let i = 0; i < sortedResults.length; i++) {
      const result = sortedResults[i];
      const isWinner = i === 0;
      
      await updateUserStats(result.userId, result, isWinner);
      
      // Update achievements
      await updateAchievementProgress(result.userId, {
        wpm: result.wpm,
        accuracy: result.accuracy,
        isWin: isWinner
      });
      
      // Update win streak if winner
      if (isWinner) {
        await updateWinStreak(result.userId, true);
      }
    }

    console.log(`✅ Match results saved successfully for room: ${room.roomCode}`);
    
    return match;
  } catch (error) {
    console.error('❌ Error saving match results:', error);
    throw error;
  }
}

// Update user statistics
async function updateUserStats(userId: string, result: GameResult, isWinner: boolean) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Update stats
    user.gamesPlayed = (user.gamesPlayed || 0) + 1;
    if (isWinner) {
      user.wins = (user.wins || 0) + 1;
    }
    
    // Update highest WPM if this is better
    if (!user.highestWPM || result.wpm > user.highestWPM) {
      user.highestWPM = result.wpm;
    }

    // Calculate average WPM
    const currentAvg = user.averageWPM || 0;
    const totalGames = user.gamesPlayed;
    user.averageWPM = Math.round(((currentAvg * (totalGames - 1)) + result.wpm) / totalGames);

    await user.save();
    
    console.log(`📊 Updated stats for ${user.username}: ${user.gamesPlayed} games, ${user.wins} wins, ${user.highestWPM} best WPM`);
  } catch (error) {
    console.error(`❌ Error updating user stats for ${userId}:`, error);
  }
}

export const setupSocketHandlers = (io: Server) => {
  // Socket authentication middleware
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.id})`);

    // Join a room
    socket.on('join-room', async (data: JoinRoomData) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ roomCode }).populate('hostId', 'username');

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is already in the room
        const isPlayerInRoom = room.players.some(
          (p) => p.userId.toString() === socket.userId
        );

        if (!isPlayerInRoom) {
          socket.emit('error', { message: 'You are not a member of this room' });
          return;
        }

        // Join the socket room
        socket.join(roomCode);

        // Notify others in the room
        socket.to(roomCode).emit('player-joined', {
          userId: socket.userId,
          username: socket.username,
          socketId: socket.id
        });

        // Send current room state to the joining player
        socket.emit('room-state', {
          roomCode: room.roomCode,
          host: room.hostId,
          players: room.players,
          status: room.status,
          maxPlayers: room.maxPlayers,
          duration: room.duration,
          language: room.language
        });

        console.log(`👥 ${socket.username} joined room: ${roomCode}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave a room
    socket.on('leave-room', async (data: JoinRoomData) => {
      try {
        const { roomCode } = data;
        
        socket.leave(roomCode);
        
        // Notify others in the room
        socket.to(roomCode).emit('player-left', {
          userId: socket.userId,
          username: socket.username
        });

        console.log(`👋 ${socket.username} left room: ${roomCode}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Update ready status
    socket.on('toggle-ready', async (data: ReadyStatusData) => {
      try {
        const { roomCode, isReady } = data;
        
        const room = await Room.findOne({ roomCode });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Update player ready status
        const player = room.players.find(p => p.userId.toString() === socket.userId);
        if (player) {
          player.ready = isReady;
          await room.save();

          // Notify all players in the room (including the sender)
          io.to(roomCode).emit('player-ready-status', {
            userId: socket.userId,
            username: socket.username,
            isReady
          });

          // Check if all players are ready
          const readyCount = room.players.filter(p => p.ready).length;
          const totalPlayers = room.players.length;
          const allReady = readyCount === totalPlayers;
          const minPlayers = totalPlayers >= 2;

          console.log(`✋ ${socket.username} ready status: ${isReady} in room ${roomCode} (${readyCount}/${totalPlayers} ready)`);

          // Notify about can start status
          if (allReady && minPlayers && readyCount >= 2) {
            io.to(roomCode).emit('all-players-ready', { canStart: true });
            console.log(`✅ All players ready in room ${roomCode}, can start!`);
          } else {
            io.to(roomCode).emit('all-players-ready', { canStart: false });
            console.log(`⏳ Not all ready in room ${roomCode} (${readyCount}/${totalPlayers})`);
          }
        }
      } catch (error) {
        console.error('Error toggling ready:', error);
        socket.emit('error', { message: 'Failed to update ready status' });
      }
    });

    // Start game (host only)
    socket.on('start-game', async (data: JoinRoomData) => {
      try {
        const { roomCode } = data;
        
        console.log(`🎮 Start game requested by ${socket.username} for room: ${roomCode}`);
        
        const room = await Room.findOne({ roomCode });
        if (!room) {
          console.log('❌ Room not found');
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is the host
        if (room.hostId.toString() !== socket.userId) {
          console.log('❌ Not the host');
          socket.emit('error', { message: 'Only the host can start the game' });
          return;
        }

        // Count ready players
        const readyPlayers = room.players.filter(p => p.ready);
        console.log(`✅ Ready players: ${readyPlayers.length}/${room.players.length}`);
        
        if (readyPlayers.length < 2) {
          console.log('❌ Not enough ready players');
          socket.emit('error', { message: 'Need at least 2 ready players to start' });
          return;
        }

        // ✅ FIX: Snapshot the player count NOW (before any disconnects during the game)
        expectedPlayers.set(roomCode, room.players.length);
        // Clear any previous results for this room
        gameResults.set(roomCode, []);
        savedRooms.delete(roomCode);

        // Update room status
        room.status = 'playing';
        await room.save();

        // Notify all players to start countdown
        console.log(`🎮 Starting game in room: ${roomCode} with ${room.players.length} players`);
        io.to(roomCode).emit('game-starting', {
          countdown: 3,
          message: 'Get ready!'
        });
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    // Typing progress update
    socket.on('typing-progress', (data: TypingProgressData) => {
      const { roomCode, progress, wpm, accuracy } = data;
      
      // Broadcast to all other players in the room (including self for consistency)
      io.to(roomCode).emit('player-progress', {
        userId: socket.userId,
        username: socket.username,
        progress,
        wpm,
        accuracy,
        timestamp: Date.now()
      });
    });

    // Player finished typing
    socket.on('game-complete', async (data: GameCompleteData) => {
      try {
        const { roomCode, wpm, accuracy, timeTaken, paragraph } = data;

        // Skip if this room was already saved
        if (savedRooms.has(roomCode)) {
          console.log(`⚠️ Room ${roomCode} already saved, skipping duplicate game-complete from ${socket.username}`);
          return;
        }

        // Ensure results array exists for this room
        if (!gameResults.has(roomCode)) {
          gameResults.set(roomCode, []);
        }

        const results = gameResults.get(roomCode)!;

        // Prevent duplicate results from the same player
        const alreadySubmitted = results.some(r => r.userId === socket.userId);
        if (alreadySubmitted) {
          console.log(`⚠️ ${socket.username} already submitted result for room ${roomCode}`);
          return;
        }

        const playerResult: GameResult = {
          userId: socket.userId!,
          username: socket.username!,
          wpm,
          accuracy,
          timeTaken,
          finishedAt: Date.now(),
          paragraph: paragraph || 'N/A'
        };

        results.push(playerResult);
        gameResults.set(roomCode, results);

        // Broadcast to all players
        io.to(roomCode).emit('player-finished', {
          userId: socket.userId,
          username: socket.username,
          wpm,
          accuracy,
          timeTaken,
          timestamp: Date.now()
        });

        console.log(`🏁 ${socket.username} finished in room: ${roomCode} - ${wpm} WPM, ${accuracy}% accuracy`);

        // ✅ FIX: Use snapshotted player count, not current (which may have changed due to disconnects)
        const totalExpected = expectedPlayers.get(roomCode) || results.length;
        const finishedCount = results.length;

        console.log(`📊 Progress: ${finishedCount}/${totalExpected} players finished in ${roomCode}`);

        const tryToSave = async () => {
          // Guard against double-save
          if (savedRooms.has(roomCode)) return;
          savedRooms.add(roomCode);

          // Cancel any pending save timer
          if (saveTimers.has(roomCode)) {
            clearTimeout(saveTimers.get(roomCode)!);
            saveTimers.delete(roomCode);
          }

          const finalResults = gameResults.get(roomCode) || [];
          if (finalResults.length === 0) return;

          const room = await Room.findOne({ roomCode });
          if (!room) return;

          console.log(`💾 Saving match for room ${roomCode} with ${finalResults.length} players...`);
          await saveMatchResults(room, finalResults);

          // Clean up
          gameResults.delete(roomCode);
          expectedPlayers.delete(roomCode);
        };

        if (finishedCount >= totalExpected) {
          // All expected players finished — save immediately
          console.log(`✅ All ${totalExpected} players finished in ${roomCode}, saving now...`);
          await tryToSave();
        } else if (finishedCount === 1) {
          // First player finished — start a 6-second fallback timer
          // This ensures stragglers and non-finishers still get their stats saved
          console.log(`⏳ Starting 6s fallback save timer for room ${roomCode}`);
          const timer = setTimeout(async () => {
            console.log(`⏰ Fallback timer fired for room ${roomCode} — saving ${gameResults.get(roomCode)?.length || 0} results`);
            await tryToSave();
          }, 6000);
          saveTimers.set(roomCode, timer);
        }

      } catch (error) {
        console.error('Error completing game:', error);
      }
    });

    // End game (triggered by timer or all players finished)
    socket.on('end-game', async (data: { roomCode: string }) => {
      try {
        const { roomCode } = data;
        
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        // Update room status back to waiting
        room.status = 'waiting';
        room.players.forEach(p => {
          p.ready = false;
        });
        await room.save();

        console.log(`🏁 Game ended in room: ${roomCode}`);
        
        // Notify all players that game has ended
        io.to(roomCode).emit('game-ended', {
          message: 'Game completed',
          roomCode
        });
      } catch (error) {
        console.error('Error ending game:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        // Find and update rooms where this user was present
        const rooms = await Room.find({
          'players.userId': socket.userId,
          status: { $in: ['waiting', 'playing'] }
        });

        for (const room of rooms) {
          // Remove player from room
          room.players = room.players.filter(
            p => p.userId.toString() !== socket.userId
          );

          if (room.players.length === 0) {
            // Delete room if empty
            await Room.deleteOne({ _id: room._id });
            console.log(`🗑️  Room deleted: ${room.roomCode}`);
          } else {
            // If host disconnected, assign new host
            if (room.hostId.toString() === socket.userId) {
              room.hostId = room.players[0].userId;
            }
            await room.save();

            // Notify remaining players
            io.to(room.roomCode).emit('player-left', {
              userId: socket.userId,
              username: socket.username
            });
          }
        }

        console.log(`❌ User disconnected: ${socket.username} (${socket.id})`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};
