import { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// ─── Create checkout session ──────────────────────────────────────────────────
export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = req.user!.userId;

    const course = await prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    // Check already purchased
    const existing = await prisma.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      res.status(409).json({ error: 'You already own this course.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.subtitle ?? undefined,
              images: course.thumbnail ? [course.thumbnail] : [],
            },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        courseId,
      },
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${courseId}?cancelled=true`,
      allow_promotion_codes: true,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
};

// ─── Stripe webhook ───────────────────────────────────────────────────────────
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err);
    res.status(400).json({ error: 'Invalid webhook signature.' });
    return;
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const { userId, courseId } = session.metadata as {
          userId: string;
          courseId: string;
        };

        if (!userId || !courseId) break;

        const amount = (session.amount_total ?? 0) / 100;

        // Create purchase record
        await prisma.purchase.upsert({
          where: { userId_courseId: { userId, courseId } },
          update: {},
          create: {
            userId,
            courseId,
            amount,
            stripePaymentId: session.payment_intent as string,
            status: 'completed',
          },
        });

        // Send confirmation email (non-blocking)
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (user && course) {
          const { sendPurchaseConfirmationEmail } = await import('../utils/email');
          sendPurchaseConfirmationEmail(user.name, user.email, course.title, courseId).catch(console.error);
        }

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await prisma.purchase.updateMany({
          where: { stripePaymentId: charge.payment_intent as string },
          data: { status: 'refunded' },
        });
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

// ─── Verify session after redirect ───────────────────────────────────────────
export const verifyCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.userId;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      res.status(400).json({ error: 'Payment not completed.' });
      return;
    }

    const courseId = session.metadata?.courseId;
    if (!courseId) {
      res.status(400).json({ error: 'Invalid session.' });
      return;
    }

    const purchase = await prisma.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: { course: { select: { id: true, title: true, thumbnail: true } } },
    });

    res.json({
      success: true,
      course: purchase?.course ?? null,
    });
  } catch (err) {
    console.error('Verify session error:', err);
    res.status(500).json({ error: 'Failed to verify session.' });
  }
};

// ─── Check enrollment ─────────────────────────────────────────────────────────
export const checkEnrollment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    const purchase = await prisma.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    res.json({ enrolled: !!purchase, status: purchase?.status ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check enrollment.' });
  }
};
