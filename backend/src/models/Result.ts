import mongoose, { Document, Schema } from 'mongoose';

export interface IResult extends Document {
  userId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  wpm: number;
  accuracy: number;
  mistakes: number;
  position: number;
  createdAt: Date;
}

const ResultSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchId: {
    type: Schema.Types.ObjectId,
    ref: 'Match'
  },
  wpm: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  mistakes: {
    type: Number,
    default: 0
  },
  position: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
ResultSchema.index({ userId: 1, createdAt: -1 });
ResultSchema.index({ matchId: 1 });

export default mongoose.model<IResult>('Result', ResultSchema);
