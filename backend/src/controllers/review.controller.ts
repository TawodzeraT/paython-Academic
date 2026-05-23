import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ─── Submit review ────────────────────────────────────────────────────────────
export const submitReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid review data.' });
      return;
    }

    // Must be enrolled
    const purchase = await prisma.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!purchase) {
      res.status(403).json({ error: 'You must purchase this course to leave a review.' });
      return;
    }

    const review = await prisma.review.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { rating: parsed.data.rating, comment: parsed.data.comment },
      create: { userId, courseId, rating: parsed.data.rating, comment: parsed.data.comment },
      include: { user: { select: { name: true, avatar: true } } },
    });

    res.json({ review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
};

// ─── Get reviews for a course ─────────────────────────────────────────────────
export const getCourseReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId;

    const reviews = await prisma.review.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, avatar: true } } },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
        : 0;

    const userReview = userId
      ? reviews.find((r) => r.userId === userId) ?? null
      : null;

    res.json({
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      total: reviews.length,
      userReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};

// ─── Delete review (admin or own) ────────────────────────────────────────────
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) { res.status(404).json({ error: 'Review not found.' }); return; }

    if (review.userId !== userId && role === 'STUDENT') {
      res.status(403).json({ error: 'Not authorized.' });
      return;
    }

    await prisma.review.delete({ where: { id: reviewId } });
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
};
