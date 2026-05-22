import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    const progress = await prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true, completedAt: true },
      orderBy: { completedAt: 'desc' },
    });

    const completedLessonIds = new Set(progress.map((p) => p.lessonId));

    const courses = purchases.map((purchase) => {
      const allLessons = purchase.course.modules.flatMap((m) => m.lessons);
      const totalLessons = allLessons.length;
      const completedLessons = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
      const courseProgress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      return {
        id: purchase.course.id,
        title: purchase.course.title,
        thumbnail: purchase.course.thumbnail,
        progress: courseProgress,
        totalLessons,
        completedLessons,
        lastWatchedAt: progress[0]?.completedAt ?? null,
      };
    });

    // Sort: in-progress first, then completed
    courses.sort((a, b) => {
      if (a.progress === 100 && b.progress !== 100) return 1;
      if (b.progress === 100 && a.progress !== 100) return -1;
      return b.progress - a.progress;
    });

    const certificates = await prisma.certificate.count({ where: { userId } });

    const totalWatchedSecs = await prisma.lessonProgress.aggregate({
      where: { userId },
      _sum: { watchedSecs: true },
    });

    res.json({
      courses,
      stats: {
        enrolledCourses: purchases.length,
        completedCourses: courses.filter((c) => c.progress === 100).length,
        certificates,
        totalMinutes: Math.round((totalWatchedSecs._sum.watchedSecs ?? 0) / 60),
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};
export const getMyCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const certificates = await prisma.certificate.findMany({
      where: { userId, revokedAt: null },
      include: {
        course: {
          select: { id: true, title: true, thumbnail: true, difficulty: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    res.json({ certificates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificates.' });
  }
};

export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    const cert = await prisma.certificate.findUnique({
      where: { uniqueCode: code },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, difficulty: true, thumbnail: true } },
      },
    });

    if (!cert || cert.revokedAt) {
      res.status(404).json({ valid: false, error: 'Certificate not found or revoked.' });
      return;
    }

    res.json({
      valid: true,
      certificate: {
        uniqueCode: cert.uniqueCode,
        issuedAt: cert.issuedAt,
        studentName: cert.user.name,
        courseTitle: cert.course.title,
        difficulty: cert.course.difficulty,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed.' });
  }
};
