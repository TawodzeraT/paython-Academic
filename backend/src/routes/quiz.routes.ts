import { Router } from 'express';
import {
  getLessonQuiz,
  submitQuiz,
  createQuiz,
  updateQuiz,
  getQuizAttempts,
} from '../controllers/quiz.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Student routes
router.get('/lesson/:lessonId', getLessonQuiz);
router.post('/:quizId/submit', submitQuiz);

// Admin routes
router.post('/lesson/:lessonId/create', restrictTo('ADMIN', 'SUPER_ADMIN'), createQuiz);
router.patch('/:quizId', restrictTo('ADMIN', 'SUPER_ADMIN'), updateQuiz);
router.get('/:quizId/attempts', restrictTo('ADMIN', 'SUPER_ADMIN'), getQuizAttempts);

export default router;
