import { Response } from 'express';
import Room from '../models/Room';
import { AuthRequest } from '../middleware/auth';
import { generateRoomCode } from '../utils/generateRoomCode';

// @desc    Create room
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { maxPlayers, duration, language, isPrivate, password } = req.body;
    const userId = req.user?._id;
    const username = req.user?.username;

    // Generate unique room code
    let roomCode = generateRoomCode();
    let roomExists = await Room.findOne({ roomCode });
    
    while (roomExists) {
      roomCode = generateRoomCode();
      roomExists = await Room.findOne({ roomCode });
    }

    const room = await Room.create({
      roomCode,
      hostId: userId,
      players: [{
        userId,
        username,
        ready: true
      }],
      maxPlayers: maxPlayers || 4,
      duration: duration || 60,
      language: language || 'english',
      isPrivate: isPrivate || false,
      password: password || undefined
    });

    res.status(201).json({
      success: true,
      room
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get room by code
// @route   GET /api/rooms/:roomCode
// @access  Public
export const getRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode }).populate('hostId', 'name username');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({
      success: true,
      room
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all public rooms
// @route   GET /api/rooms
// @access  Public
export const getPublicRooms = async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await Room.find({ 
      isPrivate: false,
      status: 'waiting'
    }).populate('hostId', 'name username').limit(20);

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join room
// @route   POST /api/rooms/:roomCode/join
// @access  Private
export const joinRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomCode } = req.params;
    const { password } = req.body;
    const userId = req.user?._id;
    const username = req.user?.username;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ success: false, message: 'Room is full' });
    }

    // Check if already in room
    const alreadyInRoom = room.players.some(p => p.userId.toString() === userId?.toString());
    if (alreadyInRoom) {
      return res.status(400).json({ success: false, message: 'Already in this room' });
    }

    // Check password if private
    if (room.isPrivate && room.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Add player
    room.players.push({
      userId: userId!,
      username: username!,
      ready: false
    });

    await room.save();

    res.json({
      success: true,
      room
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Leave room
// @route   POST /api/rooms/:roomCode/leave
// @access  Private
export const leaveRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user?._id;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Remove player
    room.players = room.players.filter(p => p.userId.toString() !== userId?.toString());

    // Delete room if empty
    if (room.players.length === 0) {
      await Room.deleteOne({ _id: room._id });
      return res.json({ success: true, message: 'Room deleted' });
    }

    // Transfer host if current host leaves
    if (room.hostId.toString() === userId?.toString()) {
      room.hostId = room.players[0].userId;
    }

    await room.save();

    res.json({
      success: true,
      room
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:roomCode
// @access  Private
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user?._id;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Only host can delete
    if (room.hostId.toString() !== userId?.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can delete room' });
    }

    await Room.deleteOne({ _id: room._id });

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
