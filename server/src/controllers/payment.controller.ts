import { Request, Response } from 'express';
import crypto from 'crypto';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';

let Razorpay: any;
let razorpayInstance: any;

try {
  Razorpay = require('razorpay');
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
  });
} catch {
  console.warn('Razorpay not available, using mock mode');
}

// POST /api/payments/create-order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    let orderId: string;
    let order: any;

    if (razorpayInstance && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder') {
      order = await razorpayInstance.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `bba_${bookingId}`,
      });
      orderId = order.id;
    } else {
      // Mock order for demo
      orderId = `order_mock_${Date.now()}`;
      order = { id: orderId, amount: Math.round(amount * 100), currency: 'INR' };
    }

    booking.razorpayOrderId = orderId;
    await booking.save();

    await Payment.create({
      bookingId,
      razorpayOrderId: orderId,
      amount,
      status: 'created',
    });

    res.json({ success: true, data: { orderId, amount: Math.round(amount * 100), currency: 'INR', key: process.env.RAZORPAY_KEY_ID } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create order', error: String(err) });
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const isMock = !razorpay_signature || razorpay_order_id?.startsWith('order_mock_');

    let isValid = isMock;
    if (!isMock) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');
      isValid = expectedSignature === razorpay_signature;
    }

    if (!isValid) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed', razorpayPaymentId: razorpay_payment_id }
      );
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'failed' });
      res.status(400).json({ success: false, message: 'Payment verification failed' });
      return;
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'success', razorpayPaymentId: razorpay_payment_id || `pay_mock_${Date.now()}` }
    );
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: 'success', bookingStatus: 'confirmed' },
      { new: true }
    );

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: String(err) });
  }
};
