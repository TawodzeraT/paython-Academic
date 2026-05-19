import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  await transporter.sendMail({
    from: `"Paython Academy" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

export const sendWelcomeEmail = async (name: string, email: string) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Paython Academy!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#1a1a2e">Welcome, ${name}! 🐍</h1>
        <p>You're now part of Paython Academy. Start learning Python today.</p>
        <a href="${process.env.FRONTEND_URL}/courses"
           style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
          Browse Courses
        </a>
        <p style="color:#666;margin-top:32px;font-size:14px">
          The Paython Academy Team
        </p>
      </div>
    `,
  });
};

export const sendVerifyEmail = async (name: string, email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Paython Academy email',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a2e">Verify your email</h2>
        <p>Hi ${name}, click below to verify your email address.</p>
        <a href="${url}"
           style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
          Verify Email
        </a>
        <p style="color:#666;font-size:13px;margin-top:24px">
          Link expires in 24 hours. If you didn't sign up, ignore this.
        </p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (name: string, email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your Paython Academy password',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a2e">Reset your password</h2>
        <p>Hi ${name}, click below to reset your password.</p>
        <a href="${url}"
           style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px;margin-top:24px">
          Link expires in 1 hour. If you didn't request this, ignore it.
        </p>
      </div>
    `,
  });
};
