import { Router } from 'express';
import { getDashboard } from '../controllers/student.controller';
import { protect } from '../middleware/auth.middleware';
import { getDashboard, getMyCourses } from '../controllers/student.controller';

router.get('/courses', getMyCourses);
const router = Router();

router.use(protect);

router.get('/dashboard', getDashboard);

export default router;
