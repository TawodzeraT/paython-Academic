# Paython Academy 🐍

A production-ready self-paced Python learning platform.

[![CI](https://github.com/YOUR_USERNAME/paython-academy/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/paython-academy/actions)

---

## What's built

| Feature | Status |
|---------|--------|
| JWT auth + refresh tokens | ✅ |
| Google OAuth | ✅ |
| Stripe one-time payments | ✅ |
| Stripe subscriptions | ✅ |
| Course player + progress | ✅ |
| Auto certificates | ✅ |
| Quiz engine | ✅ |
| AI Tutor (Claude API) | ✅ |
| Python coding sandbox | ✅ |
| Reviews & ratings | ✅ |
| Blog / CMS | ✅ |
| Admin dashboard | ✅ |
| Revenue analytics | ✅ |
| Gamification (XP, badges) | ✅ |
| Dark mode | ✅ |
| Fully responsive | ✅ |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL + Prisma |
| Auth | JWT + refresh tokens |
| Payments | Stripe |
| AI | Anthropic Claude API |
| Email | Resend |
| Charts | Recharts |
| Storage | Cloudflare R2 |
| Video | Mux / Vimeo |

---

## Quick start (Codespaces)

```bash
# 1. Open in GitHub Codespaces

# 2. Backend
cd backend
npm install
cp .env.example .env
# Fill in .env with your Neon DB URL and keys

npx prisma generate
npx prisma migrate dev --name init
npx prisma migrate dev --name add_blog
npx prisma migrate dev --name add_coding_sandbox
npx ts-node src/seed.ts
npm run dev

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
# Fill in .env.local
npm run dev
```

---

## Default admin credentials

```
Email:    admin@paythonacademy.com
Password: Admin1234!
```

Change immediately after first login.

---

## Migrations to run in order

```bash
cd backend
npx prisma migrate dev --name init
npx prisma migrate dev --name add_blog
npx prisma migrate dev --name add_coding_sandbox
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

---

## Project structure

```
paython-academy/
├── backend/
│   └── src/
│       ├── controllers/      # auth, course, student, admin,
│       │                     # payment, quiz, review, blog,
│       │                     # ai, gamification
│       ├── middleware/       # auth, validate, security
│       ├── routes/           # 8 route files
│       ├── utils/            # prisma, jwt, email
│       ├── validators/       # zod schemas
│       └── prisma/           # schema + migrations
├── frontend/
│   ├── app/
│   │   ├── (auth)/           # login, register, forgot-password
│   │   ├── (dashboard)/      # student dashboard + player
│   │   ├── (admin)/          # admin panel
│   │   └── (marketing)/      # homepage, courses, blog
│   ├── components/
│   │   ├── admin/            # sidebar, nav
│   │   ├── auth/             # ProtectedRoute
│   │   ├── course/           # ReviewSection
│   │   ├── dashboard/        # Sidebar, MobileNav, StatsWidget
│   │   ├── player/           # VideoPlayer, PlayerSidebar,
│   │   │                     # LessonContent, QuizPlayer,
│   │   │                     # AiTutor, CodeSandbox
│   │   └── ui/               # Button, Input
│   ├── lib/                  # axios client
│   └── store/                # zustand auth store
├── .github/workflows/        # CI + deploy
├── docker-compose.yml
├── DEPLOYMENT.md
└── README.md
```

---

## License

MIT
