import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller';
import { authUser } from '../middlewares/auth';

const router = Router();

router.post('/create-order', authUser, createOrder);
router.post('/verify', authUser, verifyPayment);

export default router;
