import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db';
import { Activity } from './models/Activity';
import { User } from './models/User';
import { Booking } from './models/Booking';
import { Admin } from './models/Admin';
import { Payment } from './models/Payment';

dotenv.config();

export const seedData = async (isStandalone = false) => {
  if (isStandalone) await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    Activity.deleteMany({}),
    User.deleteMany({}),
    Booking.deleteMany({}),
    Admin.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  // Seed Admin
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
  const admin = await Admin.create({
    email: process.env.ADMIN_EMAIL || 'admin@battlebox.com',
    passwordHash,
    name: 'Arena Admin',
  });
  console.log('✅ Admin created:', admin.email);

  // Seed Activities (omitted the middle for brevity, keeping all logic)
  const activities = await Activity.insertMany([
    { name: 'Badminton', type: 'court', totalUnits: 4, pricePerSlot: 300, slotDurationMins: 60, accent: '#00FF87' },
    { name: 'Snooker', type: 'table', totalUnits: 3, pricePerSlot: 200, slotDurationMins: 60, accent: '#F59E0B' },
    { name: 'Pickleball', type: 'court', totalUnits: 2, pricePerSlot: 250, slotDurationMins: 60, accent: '#00D4FF' },
  ]);
  
  const phones = ['+919876543210', '+919876543211', '+919876543212', '+919876543213', '+919876543214'];
  const names = ['Arjun Sharma', 'Priya Patel', 'Rahul Kumar', 'Sneha Reddy', 'Vikram Singh'];
  const users = await User.insertMany(phones.map((phone, i) => ({ phone, name: names[i] })));

  const statuses: Array<'confirmed' | 'cancelled' | 'expired'> = ['confirmed', 'confirmed', 'confirmed', 'cancelled', 'confirmed'];
  const payStatuses: Array<'success' | 'failed' | 'pending'> = ['success', 'success', 'success', 'failed', 'success'];
  const bookingsData = [];
  const paymentsData = [];

  for (let day = 0; day < 30; day++) {
    const d = new Date();
    d.setDate(d.getDate() - day);
    const dateStr = d.toISOString().split('T')[0];
    for (let i = 0; i < 3; i++) {
        const activity = activities[i % activities.length];
        const user = users[i % users.length];
        const hour = 8 + (i * 2);
        const bStatus = statuses[day % statuses.length];
        const pStatus = payStatuses[day % payStatuses.length];
        const amount = activity.pricePerSlot * (hour >= 18 && hour < 21 ? 1.5 : 1);
        const orderId = `order_seed_${day}_${i}`;
        bookingsData.push({
            userId: user._id,
            activityId: activity._id,
            unitNumber: (i % activity.totalUnits) + 1,
            date: dateStr,
            startTime: `${String(hour).padStart(2, '0')}:00`,
            endTime: `${String(hour + 1).padStart(2, '0')}:00`,
            totalAmount: amount,
            paymentStatus: pStatus,
            bookingStatus: bStatus,
            razorpayOrderId: orderId,
            createdAt: d,
        });
        if (pStatus === 'success') {
            paymentsData.push({
                razorpayOrderId: orderId,
                razorpayPaymentId: `pay_seed_${day}_${i}`,
                amount,
                status: 'success',
                createdAt: d,
            });
        }
    }
  }

  const bookings = await Booking.insertMany(bookingsData);
  const fullPayments = paymentsData.map((p, i) => ({
    ...p,
    bookingId: bookings[Math.floor(i * (bookings.length / paymentsData.length))]._id,
  }));
  await Payment.insertMany(fullPayments);

  console.log('🎉 Seed complete!');
  if (isStandalone) process.exit(0);
};

if (require.main === module) {
  seedData(true).catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
