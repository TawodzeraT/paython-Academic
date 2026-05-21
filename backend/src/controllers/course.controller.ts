import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── Public: Get all published courses ───────────────────────────────────────
export const getPublishedCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { modules: true, purchases: true, reviews: true } },
        reviews: { select: { rating: true } },
        modules: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = courses.map((c) => {
      const totalLessons = c.modules.reduce((a, m) => a + m._count.lessons, 0);
      const avgRating =
        c.reviews.length > 0
          ? c.reviews.reduce((a, r) => a + r.rating, 0) / c.reviews.length
          : null;
      return {
        id: c.id,
        title: c.title,
        subtitle: c.subtitle,
        thumbnail: c.thumbnail,
        price: c.price,
        difficulty: c.difficulty,
        duration: c.duration,
        tags: c.tags,
        totalLessons,
        totalStudents: c._count.purchases,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        totalReviews: c._count.reviews,
      };
    });

    res.json({ courses: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

// ─── Public: Get single course detail ────────────────────────────────────────
export const getCourseDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                isFree: true,
                order: true,
              },
            },
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, avatar: true } },
          },
        },
        _count: { select: { purchases: true, reviews: true } },
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    const avgRating =
      course.reviews.length > 0
        ? course.reviews.reduce((a, r) => a + r.rating, 0) / course.reviews.length
        : null;

    res.json({
      course: {
        ...course,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        totalStudents: course._count.purchases,
        totalReviews: course._count.reviews,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch course.' });
  }
};

// ─── Authenticated: Get course with full lesson content (enrolled only) ──────
export const getCoursePlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    // Check enrollment
    const purchase = await prisma.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!purchase) {
      res.status(403).json({ error: 'You are not enrolled in this course.' });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                attachments: true,
                quiz: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    // Get user progress for this course
    const allLessonIds = course.modules.flatMap((m) =>
      m.lessons.map((l) => l.id)
    );

    const progress = await prisma.lessonProgress.findMany({
      where: { userId, lessonId: { in: allLessonIds } },
    });

    const progressMap = new Map(progress.map((p) => [p.lessonId, p]));

    // Attach progress to each lesson
    const modulesWithProgress = course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        progress: progressMap.get(lesson.id) ?? null,
      })),
    }));

    res.json({ course: { ...course, modules: modulesWithProgress } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load course player.' });
  }
};

// ─── Get single lesson content ────────────────────────────────────────────────
export const getLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user!.userId;

    // Verify enrollment
    const purchase = await prisma.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!purchase) {
      res.status(403).json({ error: 'Not enrolled in this course.' });
      return;
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        attachments: true,
        quiz: {
          include: {
            questions: { orderBy: { order: 'asc' } },
          },
        },
        module: { select: { courseId: true, title: true } },
      },
    });

    if (!lesson || lesson.module.courseId !== courseId) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    const progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    res.json({ lesson, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load lesson.' });
  }
};
