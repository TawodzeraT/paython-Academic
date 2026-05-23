import { Router } from 'express';
import { askTutor, getCodingHint } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.post('/tutor', askTutor);
router.post('/hint', getCodingHint);

export default router;
