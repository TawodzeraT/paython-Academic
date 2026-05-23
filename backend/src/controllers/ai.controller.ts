import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Ask AI tutor a question about a lesson ───────────────────────────────────
export const askTutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId, question, conversationHistory } = req.body;
    const userId = req.user!.userId;

    if (!question?.trim()) {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    // Get lesson context
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: { select: { title: true, difficulty: true } },
          },
        },
      },
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
      res.status(403).json({ error: 'Not enrolled in this course.' });
      return;
    }

    const systemPrompt = `You are a friendly and expert Python tutor for Paython Academy.

Course: ${lesson.module.course.title}
Module: ${lesson.module.title}
Lesson: ${lesson.title}
Level: ${lesson.module.course.difficulty}
${lesson.content ? `\nLesson content summary:\n${lesson.content.slice(0, 800)}` : ''}

Your job:
- Answer Python questions clearly and concisely
- Always include short code examples where helpful
- Use beginner-friendly language unless the course is ADVANCED
- Keep answers focused on the current lesson topic
- If a question is off-topic, gently redirect back to the lesson
- Never write complete project solutions — guide the student to figure it out
- Format code in markdown code blocks with python syntax highlighting`;

    // Build message history
    const messages: Anthropic.MessageParam[] = [
      ...(conversationHistory ?? []),
      { role: 'user', content: question },
    ];

    // Stream the response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('message', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.write(`data: ${JSON.stringify({ error: 'Stream failed.' })}\n\n`);
      res.end();
    });

  } catch (err) {
    console.error('AI tutor error:', err);
    res.status(500).json({ error: 'AI tutor unavailable.' });
  }
};

// ─── Get coding hint for an exercise ─────────────────────────────────────────
export const getCodingHint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, challenge, error } = req.body;

    const prompt = `A Python student needs a hint.

Challenge: ${challenge}

Their current code:
\`\`\`python
${code}
\`\`\`
${error ? `\nError they're seeing:\n${error}` : ''}

Give a helpful hint that guides them in the right direction WITHOUT giving away the full solution. 
Be encouraging. Keep it under 100 words. Include a small code snippet only if absolutely necessary.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const hint = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as Anthropic.TextBlock).text)
      .join('');

    res.json({ hint });
  } catch (err) {
    console.error('Hint error:', err);
    res.status(500).json({ error: 'Could not generate hint.' });
  }
};
