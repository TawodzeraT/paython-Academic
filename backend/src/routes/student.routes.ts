import { Router } from 'express';
import { getDashboard } from '../controllers/student.controller';
import { protect } from '../middleware/auth.middleware';
import { getDashboard, getMyCourses } from '../controllers/student.controller';
import { getDashboard, getMyCourses, getMyCertificates, verifyCertificate } from '../controllers/student.controller';
import { Request, Response } from 'express';

router.get('/certificates', getMyCertificates);
router.get('/certificates/verify/:code', (req: Request, res: Response) =>
  verifyCertificate(req, res)
);
router.get('/courses', getMyCourses);
const router = Router();

router.use(protect);

router.get('/dashboard', getDashboard);

export default router;
