import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomCode: string;
  hostId: mongoose.Types.ObjectId;
  players: Array<{
    userId: mongoose.Types.ObjectId;
    username: string;
    ready: boolean;
  }>;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  language: string;
  duration: number;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
}

const RoomSchema: Schema = new Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    ready: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['waiting', 'countdown', 'playing', 'finished'],
    default: 'waiting'
  },
  language: {
    type: String,
    default: 'english'
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 8,
    default: 4
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto delete after 1 hour
  }
});

export default mongoose.model<IRoom>('Room', RoomSchema);
