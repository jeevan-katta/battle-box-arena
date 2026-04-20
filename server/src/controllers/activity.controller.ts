import { Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { Booking } from '../models/Booking';

// GET /api/activities — public, only active
export const listActivities = async (_req: Request, res: Response): Promise<void> => {
  try {
    const activities = await Activity.find({ isActive: true }).lean();
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/activities — admin, all including inactive
export const listAllActivities = async (_req: Request, res: Response): Promise<void> => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/activities/:id
export const getActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id).lean();
    if (!activity) {
      res.status(404).json({ success: false, message: 'Activity not found' });
      return;
    }
    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/activities/:id/slots?date=YYYY-MM-DD
export const getSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date } = req.query as { date: string };

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ success: false, message: 'Valid date (YYYY-MM-DD) is required' });
      return;
    }

    const activity = await Activity.findById(id).lean();
    if (!activity) {
      res.status(404).json({ success: false, message: 'Activity not found' });
      return;
    }

    // Parse openTime and closeTime from the activity document
    // Assume openTime is "HH:00" and closeTime is "HH:00" (or similar, but usually precise to hour bounds)
    // To support duration parsing, we can just use simple HH logic or generate slots based on slotDurationMins
    let currentMins = parseInt(activity.openTime?.split(':')[0] || '6') * 60 + parseInt(activity.openTime?.split(':')[1] || '0');
    let endMins = parseInt(activity.closeTime?.split(':')[0] || '23') * 60 + parseInt(activity.closeTime?.split(':')[1] || '0');
    
    // If endMins < currentMins (e.g. 23:00 to 02:00 next day), we add 24 hours. But let's assume same day.
    
    const slots: { time: string; endTime: string }[] = [];
    while (currentMins + activity.slotDurationMins <= endMins) {
      const hStr = String(Math.floor(currentMins / 60)).padStart(2, '0');
      const mStr = String(currentMins % 60).padStart(2, '0');
      const nextMins = currentMins + activity.slotDurationMins;
      const hNextStr = String(Math.floor(nextMins / 60)).padStart(2, '0');
      const mNextStr = String(nextMins % 60).padStart(2, '0');
      
      slots.push({ time: `${hStr}:${mStr}`, endTime: `${hNextStr}:${mNextStr}` });
      currentMins = nextMins;
    }

    // Auto-cancel pending bookings older than 10 minutes to unblock slots
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await Booking.updateMany({
      bookingStatus: { $ne: 'cancelled' },
      paymentStatus: 'pending',
      createdAt: { $lt: tenMinutesAgo }
    }, {
      $set: { bookingStatus: 'cancelled', cancelReason: 'Payment timeout' }
    });

    // Get existing bookings for this activity + date
    const bookings = await Booking.find({
      activityId: id,
      date,
      bookingStatus: { $ne: 'cancelled' },
    }).lean();

    // Build per-unit availability
    const unitsData = [];
    for (let unit = 1; unit <= activity.totalUnits; unit++) {
      const unitBookings = bookings.filter((b) => b.unitNumber === unit);
      const slotStatus = slots.map((slot) => {
        const bookingForSlot = unitBookings.find(
          (b) => b.startTime <= slot.time && b.endTime > slot.time
        );
        const isBooked = !!bookingForSlot;
        const status = (bookingForSlot as any)?.bookingType === 'maintenance'
          ? 'maintenance'
          : bookingForSlot?.paymentStatus === 'pending'
          ? 'pending'
          : isBooked ? 'booked' : 'available';

        return {
          startTime: slot.time,
          endTime: slot.endTime,
          isBooked,
          status,
        };
      });
      unitsData.push({ unitNumber: unit, slots: slotStatus });
    }

    // Peak pricing multiplier (6-9pm)
    const peakMultiplier = 1.5;

    res.json({
      success: true,
      data: {
        activity,
        date,
        units: unitsData,
        peakHours: { start: '18:00', end: '21:00', multiplier: peakMultiplier },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADMIN: Create activity
export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, totalUnits, pricePerSlot, slotDurationMins, accent, emoji, openTime, closeTime } = req.body;
    const activity = await Activity.create({ name, type, totalUnits, pricePerSlot, slotDurationMins, accent, emoji, openTime, closeTime });
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADMIN: Update activity
export const updateActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!activity) {
      res.status(404).json({ success: false, message: 'Not found' });
      return;
    }
    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADMIN: Delete activity
export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
