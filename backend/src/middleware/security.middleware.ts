import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';

// ─── Strict rate limiter for auth endpoints ───────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Strict rate limiter for AI endpoints ────────────────────────────────────
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'AI rate limit reached. Please slow down.' },
});

// ─── Sanitize request body — strip $ and . from keys ─────────────────────────
export const sanitizeBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  next();
};

function sanitize(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj.replace(/[<>]/g, '');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
        .map(([key, val]) => [key, sanitize(val)])
    );
  }
  return obj;
}

// ─── Check request content type ───────────────────────────────────────────────
export const requireJson = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    req.method !== 'GET' &&
    req.method !== 'DELETE' &&
    !req.is('application/json') &&
    !req.is('multipart/form-data')
  ) {
    res.status(415).json({ error: 'Content-Type must be application/json' });
    return;
  }
  next();
};
