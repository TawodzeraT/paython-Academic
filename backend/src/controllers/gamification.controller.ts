import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

interface Badge {
  id: string;
  label: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: Date | null;
}

export const getStudentStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const [
      completedLessons,
      certificates,
      purchases,
      recentProgress,
    ] = await Promise.all([
      prisma.lessonProgress.count({ where: { userId, completed: true } }),
      prisma.certificate.count({ where: { userId, revokedAt: null } }),
      prisma.purchase.count({ where: { userId, status: 'completed' } }),
      prisma.lessonProgress.findMany({
        where: { userId, completed: true },
        orderBy: { completedAt: 'desc' },
        take: 30,
        select: { completedAt: true },
      }),
    ]);

    // ── Calculate streak ──────────────────────────────────────────────────────
    const streak = calculateStreak(recentProgress.map((p) => p.completedAt!));

    // ── Calculate XP ──────────────────────────────────────────────────────────
    const xp = (completedLessons * 10) + (certificates * 100) + (purchases * 50);
    const level = Math.floor(xp / 200) + 1;
    const xpToNextLevel = (level * 200) - xp;
    const xpProgress = Math.round(((xp % 200) / 200) * 100);

    // ── Badges ────────────────────────────────────────────────────────────────
    const badges: Badge[] = [
      {
        id: 'first_lesson',
        label: 'First Steps',
        icon: '🐍',
        description: 'Complete your first lesson',
        earned: completedLessons >= 1,
      },
      {
        id: 'ten_lessons',
        label: 'Getting Started',
        icon: '🔥',
        description: 'Complete 10 lessons',
        earned: completedLessons >= 10,
      },
      {
        id: 'fifty_lessons',
        label: 'On a Roll',
        icon: '⚡',
        description: 'Complete 50 lessons',
        earned: completedLessons >= 50,
      },
      {
        id: 'first_cert',
        label: 'Certified',
        icon: '🏆',
        description: 'Earn your first certificate',
        earned: certificates >= 1,
      },
      {
        id: 'three_certs',
        label: 'Triple Crown',
        icon: '👑',
        description: 'Earn 3 certificates',
        earned: certificates >= 3,
      },
      {
        id: 'streak_7',
        label: 'Week Warrior',
        icon: '📅',
        description: '7-day learning streak',
        earned: streak >= 7,
      },
      {
        id: 'streak_30',
        label: 'Monthly Master',
        icon: '🗓️',
        description: '30-day learning streak',
        earned: streak >= 30,
      },
      {
        id: 'first_course',
        label: 'Investor',
        icon: '💎',
        description: 'Purchase your first course',
        earned: purchases >= 1,
      },
    ];

    res.json({
      xp,
      level,
      xpToNextLevel,
      xpProgress,
      streak,
      completedLessons,
      certificates,
      badges,
      earnedBadges: badges.filter((b) => b.earned).length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats.' });
  }
};

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = [...new Set(
    dates.map((d) => new Date(d).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const day of uniqueDays) {
    const dayDate = new Date(day);
    const diffDays = Math.round(
      (current.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 1) {
      streak++;
      current = dayDate;
    } else {
      break;
    }
  }

  return streak;
}
