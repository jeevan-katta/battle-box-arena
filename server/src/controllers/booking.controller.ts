import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Booking } from '../models/Booking';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { acquireLock, releaseLock } from '../services/slotLock';

// POST /api/bookings — create booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { activityId, unitNumber, date, startTime, endTime, totalAmount } = req.body;

    // Build lock key
    const lockKey = `${activityId}-${unitNumber}-${date}-${startTime}`;
    const locked = acquireLock(lockKey, userId);
    if (!locked) {
      res.status(409).json({ success: false, message: 'Slot just booked, please select another' });
      return;
    }

    // Check if slot is already booked
    const conflict = await Booking.findOne({
      activityId,
      unitNumber,
      date,
      bookingStatus: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (conflict) {
      releaseLock(lockKey);
      res.status(409).json({ success: false, message: 'Slot already booked' });
      return;
    }

    const shortId = crypto.randomBytes(3).toString('hex').toUpperCase();

    const booking = await Booking.create({
      userId, activityId, unitNumber, date, startTime, endTime, totalAmount, shortId
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: String(err) });
  }
};

// GET /api/bookings/my — get user's bookings
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const bookings = await Booking.find({ userId })
      .populate('activityId', 'name type pricePerSlot accent emoji')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/bookings/:id/cancel
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { reason } = req.body;

    const booking = await Booking.findOne({ _id: req.params.id, userId });
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }
    if (booking.bookingStatus === 'cancelled') {
      res.status(400).json({ success: false, message: 'Already cancelled' });
      return;
    }

    booking.bookingStatus = 'cancelled';
    booking.cancelReason = reason || 'User cancelled';
    await booking.save();

    releaseLock(`${booking.activityId}-${booking.unitNumber}-${booking.date}-${booking.startTime}`);

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADMIN: GET /api/admin/bookings
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sport, date, status, search, unitNumber, page = '1', limit = '20' } = req.query as any;
    const filter: any = {};

    if (status) filter.bookingStatus = status;
    if (date) filter.date = date;
    if (unitNumber && !isNaN(parseInt(unitNumber))) filter.unitNumber = parseInt(unitNumber);

    // Handle activity filter (by name)
    if (sport) {
      const activity = await Activity.findOne({ name: sport });
      if (activity) filter.activityId = activity._id;
      else {
        // If sport name not found, return empty
        res.json({ success: true, data: [], total: 0, page: 1 });
        return;
      }
    }

    // Handle general search (name, phone, shortId)
    if (search && search.trim().length > 0) {
      // Escape regex special chars
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      
      const users = await User.find({
        $or: [{ name: searchRegex }, { phone: searchRegex }]
      });
      const userIds = users.map(u => u._id);
      
      filter.$or = [
        { userId: { $in: userIds } },
        { shortId: searchRegex }
      ];

      // GLOBAL SEARCH: Remove all other restrictions when searching
      delete filter.bookingStatus;
      delete filter.date;
      delete filter.unitNumber;
      delete filter.activityId;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'phone name')
      .populate('activityId', 'name type emoji accent')
      .sort({ date: -1, startTime: -1 }) // Sort by date then time
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const total = await Booking.countDocuments(filter);

    res.json({ success: true, data: bookings, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: String(err) });
  }
};

// ADMIN: Cancel booking with reason
export const adminCancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: 'cancelled', cancelReason: reason || 'Admin cancelled' },
      { new: true }
    );
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
