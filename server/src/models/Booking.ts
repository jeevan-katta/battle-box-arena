import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  activityId: mongoose.Types.ObjectId;
  unitNumber: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  totalAmount: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  bookingStatus: 'confirmed' | 'cancelled' | 'expired';
  bookingType: 'online' | 'walkin' | 'maintenance';
  razorpayOrderId?: string;
  cancelReason?: string;
  shortId?: string;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    unitNumber: { type: Number, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'expired'], default: 'confirmed' },
    bookingType: { type: String, enum: ['online', 'walkin', 'maintenance'], default: 'online' },
    razorpayOrderId: { type: String },
    cancelReason: { type: String },
    shortId: { type: String },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
