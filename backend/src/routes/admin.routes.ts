import { Router } from 'express';
import {
  getOverviewStats,
  getStudents,
  toggleBanStudent,
  getAdminCourses,
  createCourse,
  updateCourse,
  togglePublishCourse,
  deleteCourse,
  createModule,
  createLesson,
  updateLesson,
  deleteLesson,
  getRevenueData,
} from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

// Overview
router.get('/overview', getOverviewStats);

// Students
router.get('/students', getStudents);
router.patch('/students/:userId/ban', toggleBanStudent);

// Courses
router.get('/courses', getAdminCourses);
router.post('/courses', createCourse);
router.patch('/courses/:courseId', updateCourse);
router.patch('/courses/:courseId/publish', togglePublishCourse);
router.delete('/courses/:courseId', deleteCourse);

// Modules
router.post('/courses/:courseId/modules', createModule);

// Lessons
router.post('/modules/:moduleId/lessons', createLesson);
router.patch('/lessons/:lessonId', updateLesson);
router.delete('/lessons/:lessonId', deleteLesson);

// Revenue
router.get('/revenue', getRevenueData);

export default router;
