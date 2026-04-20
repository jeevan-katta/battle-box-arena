import { Router } from 'express';
import { createBooking, getMyBookings, cancelBooking, getAllBookings, adminCancelBooking } from '../controllers/booking.controller';
import { authUser, authAdmin } from '../middlewares/auth';

const router = Router();

router.get('/my', authUser, getMyBookings);
router.post('/', authUser, createBooking);
router.post('/:id/cancel', authUser, cancelBooking);

// Admin
router.get('/admin/all', authAdmin, getAllBookings);
router.post('/admin/:id/cancel', authAdmin, adminCancelBooking);

export default router;
