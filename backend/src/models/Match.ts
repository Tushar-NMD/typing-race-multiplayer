import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  roomId: mongoose.Types.ObjectId;
  players: mongoose.Types.ObjectId[];
  winner: mongoose.Types.ObjectId;
  paragraph: string;
  duration: number;
  createdAt: Date;
}

const MatchSchema: Schema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  players: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  winner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  paragraph: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IMatch>('Match', MatchSchema);
