# Paython Academy

A full-stack self-paced Python learning platform built with Next.js, Express, PostgreSQL, Stripe, and Prisma.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express.js, TypeScript     |
| Database   | PostgreSQL + Prisma ORM             |
| Auth       | JWT (access + refresh tokens)       |
| Payments   | Stripe Checkout                     |
| Email      | Resend (via Nodemailer)             |
| Storage    | Cloudflare R2 / AWS S3              |
| Video      | Mux or Vimeo private embeds         |
| Charts     | Recharts                            |

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or hosted)
- A Stripe account (free test mode)
- A Resend account (free tier)

---

## 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/paython-academy.git
cd paython-academy
```

---

## 2. Set up the backend

```bash
cd backend
npm install
```

Copy the env file and fill it in:

```bash
cp .env.example .env
```

Open `backend/.env` and set:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

DATABASE_URL="postgresql://postgres:password@localhost:5432/paython_academy"

JWT_SECRET=change_this_to_a_long_random_string
JWT_REFRESH_SECRET=change_this_to_another_long_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
EMAIL_FROM=noreply@paythonacademy.com
```

---

## 3. Set up the database

Create the database in PostgreSQL:

```sql
CREATE DATABASE paython_academy;
```

Run Prisma migrations:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Open Prisma Studio to inspect the database (optional):

```bash
npx prisma studio
```

---

## 4. Create your first admin user

After running migrations, open Prisma Studio at `http://localhost:5555`,
find the `users` table, and manually set `role` to `SUPER_ADMIN` on your account
after registering through the frontend.

Or use this one-time seed script — create `backend/src/seed.ts`:

```typescript
import { prisma } from './utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const password = await bcrypt.hash('Admin1234!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@paythonacademy.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@paythonacademy.com',
      password,
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
    },
  });
  console.log('Admin created: admin@paythonacademy.com / Admin1234!');
}

main().then(() => prisma.$disconnect());
```

Run it:

```bash
npx ts-node src/seed.ts
```

---

## 5. Set up the frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Open `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 6. Run everything

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Backend runs at `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:3000`

---

## 7. Test Stripe webhooks locally

Install the Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copy the webhook signing secret it prints and paste it into `STRIPE_WEBHOOK_SECRET` in your `.env`.

---

## 8. Key URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Homepage |
| `http://localhost:3000/courses` | Course catalog |
| `http://localhost:3000/login` | Student login |
| `http://localhost:3000/register` | Student register |
| `http://localhost:3000/dashboard` | Student dashboard |
| `http://localhost:3000/admin` | Admin panel |
| `http://localhost:5000/health` | API health check |
| `http://localhost:5555` | Prisma Studio |

---

## 9. Folder structure

```
paython-academy/
├── backend/
│   └── src/
│       ├── controllers/     # Route handlers
│       ├── middleware/      # Auth, validation
│       ├── routes/          # Express routers
│       ├── utils/           # Prisma, JWT, email
│       ├── validators/      # Zod schemas
│       └── prisma/          # schema.prisma
├── frontend/
│   ├── app/
│   │   ├── (auth)/          # Login, register, forgot password
│   │   ├── (dashboard)/     # Student dashboard + course player
│   │   ├── (admin)/         # Admin panel
│   │   └── (marketing)/     # Homepage, courses, checkout
│   ├── components/
│   │   ├── admin/           # Admin sidebar, nav
│   │   ├── auth/            # ProtectedRoute
│   │   ├── dashboard/       # Sidebar, mobile nav
│   │   ├── player/          # VideoPlayer, PlayerSidebar, LessonContent
│   │   └── ui/              # Button, Input
│   ├── lib/                 # Axios client
│   └── store/               # Zustand auth store
└── README.md
```

---

## Phase 2 roadmap (next to build)

- [ ] Quizzes with auto-grading
- [ ] PDF certificate generation
- [ ] Blog / CMS
- [ ] Student reviews & ratings
- [ ] Admin analytics charts
- [ ] Email marketing campaigns

---

## Phase 3 Features

### AI Tutor
Add to `backend/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
```
Install the SDK:
```bash
cd backend && npm install @anthropic-ai/sdk
```

### Python Coding Sandbox
Powered by Pyodide (Python in WebAssembly) — runs entirely in the browser.
No server needed for code execution.

### Stripe Subscriptions
Create products in your Stripe dashboard then add price IDs:
```env
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_ANNUAL_PRICE_ID=price_xxx
```

### Run Phase 3 migrations
```bash
cd backend
npx prisma migrate dev --name add_coding_sandbox
```

## License

MIT
