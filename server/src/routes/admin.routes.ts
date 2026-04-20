import { Router } from 'express';
import { getDashboard, getUsers, getUserBookings, deleteUser, createWalkinBooking, createMaintenanceBlock } from '../controllers/admin.controller';
import { getAllBookings, adminCancelBooking } from '../controllers/booking.controller';
import { createActivity, updateActivity, deleteActivity, listAllActivities } from '../controllers/activity.controller';
import { authAdmin } from '../middlewares/auth';

const router = Router();

router.use(authAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:id/bookings', getUserBookings);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);
router.post('/bookings/:id/cancel', adminCancelBooking);
router.post('/walkin-booking', createWalkinBooking);
router.post('/maintenance-block', createMaintenanceBlock);
router.get('/activities', listAllActivities);
router.post('/activities', createActivity);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

export default router;
