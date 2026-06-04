import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validators';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/me', protect, getMe);

import { authLimiter } from '../middleware/security.middleware';

// Apply to sensitive routes:
router.post('/register',       authLimiter, validate(registerSchema),       register);
router.post('/login',          authLimiter, validate(loginSchema),           login);
router.post('/forgot-password',authLimiter, validate(forgotPasswordSchema),  forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema),   resetPassword);

export default router;
