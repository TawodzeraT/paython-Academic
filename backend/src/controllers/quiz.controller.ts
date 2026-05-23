import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── Get quiz for a lesson ────────────────────────────────────────────────────
export const getLessonQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.userId;

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            order: true,
            // Never send correctAnswer to client before submission
          },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'No quiz for this lesson.' });
      return;
    }

    // Get previous best attempt
    const bestAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, quizId: quiz.id },
      orderBy: { score: 'desc' },
    });

    res.json({ quiz, bestAttempt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz.' });
  }
};

// ─── Submit quiz answers ──────────────────────────────────────────────────────
export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // { [questionId]: selectedOptionIndex }
    const userId = req.user!.userId;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found.' });
      return;
    }

    // Grade answers
    let correct = 0;
    const results = quiz.questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        question: q.question,
        selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = (correct / quiz.questions.length) * 100;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        answers: answers as object,
      },
    });

    res.json({
      score,
      correct,
      total: quiz.questions.length,
      passed: score >= 70,
      results,
      attemptId: attempt.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit quiz.' });
  }
};

// ─── Admin: Create quiz for a lesson ─────────────────────────────────────────
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const { title, questions } = req.body;

    const existing = await prisma.quiz.findUnique({ where: { lessonId } });
    if (existing) {
      res.status(409).json({ error: 'Quiz already exists for this lesson.' });
      return;
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        lessonId,
        questions: {
          create: questions.map((q: {
            question: string;
            options: string[];
            correctAnswer: number;
            explanation?: string;
            order: number;
          }, idx: number) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? null,
            order: q.order ?? idx + 1,
          })),
        },
      },
      include: { questions: true },
    });

    res.status(201).json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz.' });
  }
};

// ─── Admin: Update quiz ───────────────────────────────────────────────────────
export const updateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { title, questions } = req.body;

    // Delete old questions and recreate
    await prisma.quizQuestion.deleteMany({ where: { quizId } });

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title,
        questions: {
          create: questions.map((q: {
            question: string;
            options: string[];
            correctAnswer: number;
            explanation?: string;
            order: number;
          }, idx: number) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? null,
            order: q.order ?? idx + 1,
          })),
        },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    res.json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update quiz.' });
  }
};

// ─── Admin: Get all quiz attempts ─────────────────────────────────────────────
export const getQuizAttempts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const avgScore =
      attempts.length > 0
        ? attempts.reduce((a, att) => a + att.score, 0) / attempts.length
        : 0;

    res.json({ attempts, avgScore: Math.round(avgScore) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempts.' });
  }
};
