import { Router } from 'express';
import {
  getPublishedCourses,
  getCourseDetail,
  getCoursePlayer,
  getLesson,
} from '../controllers/course.controller';
import { updateProgress, getCourseProgress } from '../controllers/progress.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getPublishedCourses);
router.get('/:courseId', getCourseDetail);

// Protected (enrolled students)
router.get('/:courseId/player', protect, getCoursePlayer);
router.get('/:courseId/progress', protect, getCourseProgress);
router.get('/:courseId/lessons/:lessonId', protect, getLesson);
router.patch('/lessons/:lessonId/progress', protect, updateProgress);

export default router;
