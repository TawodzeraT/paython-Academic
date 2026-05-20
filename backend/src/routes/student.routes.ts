import { Router } from 'express';
import { getDashboard } from '../controllers/student.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/dashboard', getDashboard);

export default router;
