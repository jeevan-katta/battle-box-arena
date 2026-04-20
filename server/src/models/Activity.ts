import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  name: string;
  type: 'court' | 'table';
  totalUnits: number;
  pricePerSlot: number;
  slotDurationMins: number;
  isActive: boolean;
  imageUrl?: string;
  accent?: string;
  emoji?: string;
  openTime: string;
  closeTime: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['court', 'table'], required: true },
    totalUnits: { type: Number, required: true, min: 1 },
    pricePerSlot: { type: Number, required: true, min: 0 },
    slotDurationMins: { type: Number, required: true, default: 60 },
    isActive: { type: Boolean, default: true },
    imageUrl: { type: String },
    accent: { type: String, default: '#00FF87' },
    emoji: { type: String, default: '🏅' },
    openTime: { type: String, default: '06:00' },
    closeTime: { type: String, default: '23:00' },
  },
  { timestamps: true }
);

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
