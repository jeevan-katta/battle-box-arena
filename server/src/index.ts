import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import activityRoutes from './routes/activity.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { Booking } from './models/Booking';

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Cron: expire pending bookings older than 5 minutes
cron.schedule('* * * * *', async () => {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000);
  const result = await Booking.updateMany(
    { bookingStatus: 'confirmed', paymentStatus: 'pending', createdAt: { $lt: cutoff } },
    { $set: { bookingStatus: 'expired' } }
  );
  if (result.modifiedCount > 0) {
    console.log(`[Cron] Expired ${result.modifiedCount} pending bookings`);
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
