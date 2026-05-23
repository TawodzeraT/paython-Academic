import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes    from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import courseRoutes  from './routes/course.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes   from './routes/admin.routes';
import quizRoutes    from './routes/quiz.routes';
import reviewRoutes  from './routes/review.routes';
import blogRoutes    from './routes/blog.routes';
import aiRoutes from './routes/ai.routes';

app.use('/api/ai', aiRoutes);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
}));

// ─── Stripe webhook (MUST be before express.json) ─────────────────────────────
app.use('/api/payments', paymentRoutes);

// ─── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Paython Academy API', timestamp: new Date() });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/student',  studentRoutes);
app.use('/api/courses',  courseRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/quiz',     quizRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/blog',     blogRoutes);

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ──────────────────────────────────────────────────────
app.use((
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Paython Academy API running on port ${PORT}`);
});

export default app;
