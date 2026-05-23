import { Router } from 'express';
import { getPosts, getPost, createPost, updatePost, deletePost } from '../controllers/blog.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getPosts);
router.get('/:slug', getPost);
router.post('/', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), createPost);
router.patch('/:postId', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), updatePost);
router.delete('/:postId', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), deletePost);

export default router;
