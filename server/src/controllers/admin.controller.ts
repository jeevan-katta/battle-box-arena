import { Request, Response } from 'express';
import crypto from 'crypto';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { Payment } from '../models/Payment';

// Helper: get start/end of a given month
function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

// GET /api/admin/dashboard?year=YYYY&month=MM
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const year = parseInt((req.query.year as string) || String(now.getFullYear()));
    const month = parseInt((req.query.month as string) || String(now.getMonth() + 1));
    const dayDate = req.query.date as string; // Optional YYYY-MM-DD

    let monthStart: Date, monthEnd: Date, monthStartStr: string, monthEndStr: string;

    if (dayDate) {
      // If a specific day is requested
      monthStart = new Date(dayDate);
      monthStart.setHours(0, 0, 0, 0);
      monthEnd = new Date(dayDate);
      monthEnd.setHours(23, 59, 59, 999);
      monthStartStr = dayDate;
      monthEndStr = dayDate;
    } else {
      // Default to entire month
      const range = getMonthRange(year, month);
      monthStart = range.start;
      monthEnd = range.end;
      monthStartStr = monthStart.toISOString().split('T')[0];
      monthEndStr = monthEnd.toISOString().split('T')[0];
    }

    const today = now.toISOString().split('T')[0];

    const [
      monthOnlineRevenue,
      monthWalkinRevenue,
      todayBookings,
      totalUsers,
      monthBookings,
      onlineBookingsCount,
      walkinBookingsCount,
      recentBookings,
      sportRevenue,
      allTimeRevenue,
    ] = await Promise.all([
      // Monthly online revenue (via payment)
      Payment.aggregate([
        { $match: { status: 'success', createdAt: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Monthly walk-in revenue (from booking.totalAmount directly)
      Booking.aggregate([
        {
          $match: {
            bookingType: 'walkin',
            bookingStatus: 'confirmed',
            paymentStatus: 'success',
            date: { $gte: monthStartStr, $lte: monthEndStr },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      // Today's bookings
      Booking.countDocuments({ date: today, bookingStatus: 'confirmed', bookingType: { $ne: 'maintenance' } }),
      // Total users
      User.countDocuments(),
      // Month total confirmed bookings (non-maintenance)
      Booking.countDocuments({
        bookingStatus: 'confirmed',
        bookingType: { $ne: 'maintenance' },
        date: { $gte: monthStartStr, $lte: monthEndStr },
      }),
      // Online bookings count this month
      Booking.countDocuments({
        bookingType: 'online',
        bookingStatus: 'confirmed',
        date: { $gte: monthStartStr, $lte: monthEndStr },
      }),
      // Walk-in bookings count this month
      Booking.countDocuments({
        bookingType: 'walkin',
        bookingStatus: 'confirmed',
        date: { $gte: monthStartStr, $lte: monthEndStr },
      }),
      // Recent bookings
      Booking.find({ bookingStatus: { $nin: ['cancelled'] }, bookingType: { $ne: 'maintenance' } })
        .populate('userId', 'phone name')
        .populate('activityId', 'name type accent emoji')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      // Sport revenue this month
      Booking.aggregate([
        {
          $match: {
            bookingStatus: 'confirmed',
            paymentStatus: 'success',
            bookingType: { $ne: 'maintenance' },
            date: { $gte: monthStartStr, $lte: monthEndStr },
          },
        },
        { $group: { _id: '$activityId', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $lookup: { from: 'activities', localField: '_id', foreignField: '_id', as: 'activity' } },
        { $unwind: '$activity' },
        { $project: { name: '$activity.name', emoji: '$activity.emoji', accent: '$activity.accent', count: 1, revenue: 1 } },
        { $sort: { revenue: -1 } },
      ]),
      // All-time total revenue
      Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    // Revenue trend for selected month (daily breakdown)
    const revenueTrend = await Booking.aggregate([
      {
        $match: {
          bookingStatus: 'confirmed',
          paymentStatus: 'success',
          bookingType: { $ne: 'maintenance' },
          date: { $gte: monthStartStr, $lte: monthEndStr },
        },
      },
      { $group: { _id: '$date', revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const onlineRev = monthOnlineRevenue[0]?.total || 0;
    const walkinRev = monthWalkinRevenue[0]?.total || 0;
    const monthTotalRevenue = onlineRev + walkinRev;

    res.json({
      success: true,
      data: {
        // Revenue
        allTimeRevenue: allTimeRevenue[0]?.total || 0,
        monthTotalRevenue,
        onlineRevenue: onlineRev,
        walkinRevenue: walkinRev,
        // Bookings
        todayBookings,
        monthBookings,
        onlineBookingsCount,
        walkinBookingsCount,
        // Users
        totalUsers,
        // Charts
        recentBookings,
        sportRevenue,
        revenueTrend,
        // Filter context
        filterYear: year,
        filterMonth: month,
        filterDate: dayDate || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: String(err) });
  }
};

// POST /api/admin/walkin-booking
export const createWalkinBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, activityId, unitNumber, date, startTime, endTime, totalAmount, paymentMethod = 'cash' } = req.body;

    if (!phone || !activityId || !unitNumber || !date || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    // Find or create user by phone
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, name: name || 'Walk-in Customer' });
    } else if (name && !user.name) {
      user.name = name;
      await user.save();
    }

    // Check slot conflict
    const conflict = await Booking.findOne({
      activityId,
      unitNumber,
      date,
      bookingStatus: 'confirmed',
      bookingType: { $ne: 'maintenance' },
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (conflict) {
      res.status(409).json({ success: false, message: 'Slot already booked' });
      return;
    }

    const shortId = crypto.randomBytes(3).toString('hex').toUpperCase();

    const booking = await Booking.create({
      userId: user._id,
      activityId,
      unitNumber,
      date,
      startTime,
      endTime,
      totalAmount: totalAmount || 0,
      paymentStatus: 'success', // walk-in = paid at counter
      bookingStatus: 'confirmed',
      bookingType: 'walkin',
      shortId,
    });

    res.status(201).json({ success: true, data: { booking, user } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: String(err) });
  }
};

// POST /api/admin/maintenance-block
export const createMaintenanceBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId, unitNumber, date, startTime, endTime, reason } = req.body;

    if (!activityId || !unitNumber || !date || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    // Check for existing confirmed bookings in this slot
    const conflict = await Booking.findOne({
      activityId,
      unitNumber,
      date,
      bookingStatus: 'confirmed',
      bookingType: { $ne: 'maintenance' },
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (conflict) {
      res.status(409).json({ success: false, message: 'There is an existing booking in this slot' });
      return;
    }

    const booking = await Booking.create({
      userId: null, // no user for maintenance
      activityId,
      unitNumber,
      date,
      startTime,
      endTime,
      totalAmount: 0,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      bookingType: 'maintenance',
      cancelReason: reason || 'Maintenance',
      shortId: 'MAINT',
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: String(err) });
  }
};

// GET /api/admin/users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query as any;
    const filter: any = {};
    if (search) filter.$or = [{ phone: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }];

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();
    const total = await User.countDocuments(filter);

    res.json({ success: true, data: users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/users/:id/bookings
export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ userId: req.params.id })
      .populate('activityId', 'name type')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
