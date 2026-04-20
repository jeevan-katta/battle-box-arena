import { Router } from 'express';
import { userLogin, adminLogin, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/user/login', userLogin);
router.post('/admin/login', adminLogin);
router.post('/logout', logout);

export default router;
