import { Router } from 'express';
import { submitReview, getCourseReviews, deleteReview } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/:courseId', protect, getCourseReviews);
router.post('/:courseId', protect, submitReview);
router.delete('/review/:reviewId', protect, deleteReview);

export default router;
