import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── Mark lesson complete / update watch time ─────────────────────────────────
export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const { completed, watchedSecs } = req.body;
    const userId = req.user!.userId;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    // Verify enrollment
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!purchase) {
      res.status(403).json({ error: 'Not enrolled.' });
      return;
    }

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        completed: completed ?? undefined,
        watchedSecs: watchedSecs ?? undefined,
        completedAt: completed ? new Date() : undefined,
      },
      create: {
        userId,
        lessonId,
        completed: completed ?? false,
        watchedSecs: watchedSecs ?? 0,
        completedAt: completed ? new Date() : null,
      },
    });

    // Check if whole course is now complete → issue certificate
    if (completed) {
      await checkAndIssueCertificate(userId, lesson.module.courseId);
    }

    res.json({ progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update progress.' });
  }
};

// ─── Get progress for a course ────────────────────────────────────────────────
export const getCourseProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: { select: { id: true } } },
        },
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

    const completed = await prisma.lessonProgress.count({
      where: { userId, lessonId: { in: allLessonIds }, completed: true },
    });

    const percentage =
      allLessonIds.length > 0
        ? Math.round((completed / allLessonIds.length) * 100)
        : 0;

    res.json({
      totalLessons: allLessonIds.length,
      completedLessons: completed,
      percentage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get progress.' });
  }
};

// ─── Internal: Auto-issue certificate on 100% completion ─────────────────────
async function checkAndIssueCertificate(userId: string, courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: { include: { lessons: { select: { id: true } } } },
      },
    });

    if (!course) return;

    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const completed = await prisma.lessonProgress.count({
      where: { userId, lessonId: { in: allLessonIds }, completed: true },
    });

    if (completed < allLessonIds.length) return;

    // Issue certificate if not already issued
    await prisma.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
    });
  } catch (err) {
    console.error('Certificate auto-issue error:', err);
  }
}
