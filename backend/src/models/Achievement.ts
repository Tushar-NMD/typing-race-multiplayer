import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementType: 'speed_demon' | 'accuracy_master' | 'win_streak' | 'first_victory' | 'typing_machine' | 'consistent_performer' | 'social_butterfly' | 'speed_racer' | 'perfect_game' | 'legendary_status';
  name: string;
  description: string;
  badge: string; // emoji or icon
  points: number;
  progress: number; // current progress
  target: number; // target to complete
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

const AchievementSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    achievementType: {
      type: String,
      enum: ['speed_demon', 'accuracy_master', 'win_streak', 'first_victory', 'typing_machine', 'consistent_performer', 'social_butterfly', 'speed_racer', 'perfect_game', 'legendary_status'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    badge: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true,
      default: 0
    },
    progress: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Index for faster queries
AchievementSchema.index({ userId: 1, createdAt: -1 });
AchievementSchema.index({ userId: 1, completed: 1 });
AchievementSchema.index({ userId: 1, achievementType: 1 });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
