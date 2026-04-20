import { Router } from 'express';
import { listActivities, getActivity, getSlots, createActivity, updateActivity, deleteActivity } from '../controllers/activity.controller';
import { authAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', listActivities);
router.get('/:id', getActivity);
router.get('/:id/slots', getSlots);

// Admin protected
router.post('/', authAdmin, createActivity);
router.put('/:id', authAdmin, updateActivity);
router.delete('/:id', authAdmin, deleteActivity);

export default router;
