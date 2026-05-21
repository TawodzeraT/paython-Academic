import { Router } from 'express';
import {
  createCheckoutSession,
  stripeWebhook,
  verifyCheckoutSession,
  checkEnrollment,
} from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';
import express from 'express';

const router = Router();

// Webhook needs raw body — must come BEFORE express.json()
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// Protected routes
router.post('/checkout', protect, createCheckoutSession);
router.get('/verify/:sessionId', protect, verifyCheckoutSession);
router.get('/enrollment/:courseId', protect, checkEnrollment);

export default router;
