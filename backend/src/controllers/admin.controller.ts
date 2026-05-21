import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── Overview stats ───────────────────────────────────────────────────────────
export const getOverviewStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalCourses,
      totalRevenue,
      totalCertificates,
      recentPurchases,
      monthlyRevenue,
      courseStats,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.purchase.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.certificate.count(),
      prisma.purchase.findMany({
        where: { status: 'completed' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      }),
      // Monthly revenue for last 6 months
      prisma.$queryRaw<{ month: string; revenue: number }[]>`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YY') AS month,
          SUM(amount)::float AS revenue
        FROM purchases
        WHERE status = 'completed'
          AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      `,
      // Top courses by enrollment
      prisma.course.findMany({
        include: {
          _count: { select: { purchases: true } },
          purchases: {
            where: { status: 'completed' },
            select: { amount: true },
          },
        },
        orderBy: { purchases: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    const topCourses = courseStats.map((c) => ({
      id: c.id,
      title: c.title,
      students: c._count.purchases,
      revenue: c.purchases.reduce((a, p) => a + p.amount, 0),
    }));

    res.json({
      stats: {
        totalStudents,
        totalCourses,
        totalRevenue: totalRevenue._sum.amount ?? 0,
        totalCertificates,
      },
      recentPurchases,
      monthlyRevenue,
      topCourses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load overview stats.' });
  }
};

// ─── Get all students ─────────────────────────────────────────────────────────
export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const search = (req.query.search as string) ?? '';
    const skip = (page - 1) * limit;

    const where = search
      ? {
          role: 'STUDENT' as const,
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { role: 'STUDENT' as const };

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          isBanned: true,
          isEmailVerified: true,
          createdAt: true,
          _count: {
            select: { purchases: true, certificates: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ students, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
};

// ─── Ban / unban student ──────────────────────────────────────────────────────
export const toggleBanStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found.' }); return; }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });

    if (updated.isBanned) {
      await prisma.refreshToken.deleteMany({ where: { userId } });
    }

    res.json({ isBanned: updated.isBanned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

// ─── Get all courses (admin) ──────────────────────────────────────────────────
export const getAdminCourses = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { modules: true, purchases: true },
        },
        purchases: {
          where: { status: 'completed' },
          select: { amount: true },
        },
      },
    });

    const result = courses.map((c) => ({
      id: c.id,
      title: c.title,
      price: c.price,
      difficulty: c.difficulty,
      isPublished: c.isPublished,
      createdAt: c.createdAt,
      modules: c._count.modules,
      students: c._count.purchases,
      revenue: c.purchases.reduce((a, p) => a + p.amount, 0),
    }));

    res.json({ courses: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

// ─── Create course ────────────────────────────────────────────────────────────
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, subtitle, description, price, difficulty, duration, tags, thumbnail } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        subtitle,
        description,
        price: parseFloat(price),
        difficulty,
        duration: duration ? parseInt(duration) : null,
        tags: tags ?? [],
        thumbnail,
        isPublished: false,
      },
    });

    res.status(201).json({ course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create course.' });
  }
};

// ─── Update course ────────────────────────────────────────────────────────────
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const data = req.body;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        duration: data.duration ? parseInt(data.duration) : undefined,
      },
    });

    res.json({ course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update course.' });
  }
};

// ─── Toggle publish ───────────────────────────────────────────────────────────
export const togglePublishCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) { res.status(404).json({ error: 'Course not found.' }); return; }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { isPublished: !course.isPublished },
    });

    res.json({ isPublished: updated.isPublished });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle publish.' });
  }
};

// ─── Delete course ────────────────────────────────────────────────────────────
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    await prisma.course.delete({ where: { id: courseId } });

    res.json({ message: 'Course deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete course.' });
  }
};

// ─── Create module ────────────────────────────────────────────────────────────
export const createModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    });

    const module = await prisma.module.create({
      data: {
        title,
        courseId,
        order: (lastModule?.order ?? 0) + 1,
      },
    });

    res.status(201).json({ module });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create module.' });
  }
};

// ─── Create lesson ────────────────────────────────────────────────────────────
export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { title, description, videoUrl, content, duration, isFree } = req.body;

    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        videoUrl,
        content,
        duration: duration ? parseInt(duration) : null,
        isFree: isFree ?? false,
        moduleId,
        order: (lastLesson?.order ?? 0) + 1,
      },
    });

    res.status(201).json({ lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create lesson.' });
  }
};

// ─── Update lesson ────────────────────────────────────────────────────────────
export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const data = req.body;

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...data,
        duration: data.duration ? parseInt(data.duration) : undefined,
      },
    });

    res.json({ lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update lesson.' });
  }
};

// ─── Delete lesson ────────────────────────────────────────────────────────────
export const deleteLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    await prisma.lesson.delete({ where: { id: lessonId } });
    res.json({ message: 'Lesson deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete lesson.' });
  }
};

// ─── Get revenue data ─────────────────────────────────────────────────────────
export const getRevenueData = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalRevenue,
      monthlyData,
      recentTransactions,
    ] = await Promise.all([
      prisma.purchase.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.$queryRaw<{ month: string; revenue: number; count: number }[]>`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YY') AS month,
          SUM(amount)::float AS revenue,
          COUNT(*)::int AS count
        FROM purchases
        WHERE status = 'completed'
          AND "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      `,
      prisma.purchase.findMany({
        where: { status: 'completed' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      }),
    ]);

    res.json({
      totalRevenue: totalRevenue._sum.amount ?? 0,
      totalSales: totalRevenue._count,
      monthlyData,
      recentTransactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch revenue data.' });
  }
};
