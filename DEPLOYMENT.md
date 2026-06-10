# Paython Academy — Deployment Guide

---

## Option A — Recommended (Free tier friendly)

| Service    | What              | Cost      |
|------------|-------------------|-----------|
| Vercel     | Frontend hosting  | Free      |
| Railway    | Backend hosting   | $5/mo     |
| Neon       | PostgreSQL        | Free      |
| Cloudflare R2 | File storage  | Free 10GB |
| Resend     | Email             | Free 3k/mo|
| Stripe     | Payments          | 2.9% + 30¢|

---

## Step 1 — Push to GitHub

```bash
git add .
git commit -m "Initial commit — Paython Academy"
git push origin main
```

---

## Step 2 — Deploy Backend to Railway

1. Go to **railway.app** and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your repo → choose the `backend` folder
4. Add all environment variables from `backend/.env`
5. Railway auto-detects Node.js and deploys
6. Copy your Railway URL e.g. `https://paython-backend.railway.app`

---

## Step 3 — Run migrations on Railway

In Railway dashboard → your backend service → **Shell**:

```bash
npx prisma migrate deploy
npx ts-node src/seed.ts
```

---

## Step 4 — Deploy Frontend to Vercel

1. Go to **vercel.com** and sign in with GitHub
2. Click **Add New Project → Import** your repo
3. Set **Root Directory** to `frontend`
4. Add environment variables:

```
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

5. Click **Deploy**

---

## Step 5 — Set up Stripe webhooks

1. Go to **Stripe Dashboard → Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-railway-url.railway.app/api/payments/webhook`
4. Select events:
   - `checkout.session.completed`
   - `charge.refunded`
5. Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET` in Railway

---

## Step 6 — Set up Cloudflare R2 (file storage)

1. Go to **Cloudflare Dashboard → R2**
2. Create bucket `paython-academy`
3. Create API token with R2 read/write permissions
4. Add to Railway env vars:

```
STORAGE_BUCKET=paython-academy
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=your_key
STORAGE_SECRET_KEY=your_secret
STORAGE_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

---

## Step 7 — Set up custom domain (optional)

**Vercel:**
1. Go to your project → **Domains**
2. Add `paythonacademy.com`
3. Update DNS at your registrar

**Railway:**
1. Go to your service → **Settings → Domains**
2. Add `api.paythonacademy.com`

---

## Step 8 — Set up GitHub Actions secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | From vercel.com/account/tokens |
| `VERCEL_ORG_ID` | From Vercel project settings |
| `VERCEL_PROJECT_ID` | From Vercel project settings |
| `RAILWAY_WEBHOOK_URL` | From Railway service → Settings |

---

## Option B — Docker (self-hosted VPS)

```bash
# On your server (Ubuntu 22.04)
git clone https://github.com/YOUR_USERNAME/paython-academy
cd paython-academy
cp .env.docker.example .env
nano .env  # fill in your values

docker compose up -d

# Run migrations
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx ts-node src/seed.ts
```

---

## Post-deployment checklist

- [ ] Visit `/health` — API returns `ok`
- [ ] Register a student account
- [ ] Verify email flow works
- [ ] Create a course in admin panel
- [ ] Add a module and lesson
- [ ] Test Stripe checkout with card `4242 4242 4242 4242`
- [ ] Verify purchase confirmation email arrives
- [ ] Complete a lesson and check certificate
- [ ] Test AI tutor in course player
- [ ] Run a Python snippet in the sandbox
- [ ] Check admin revenue dashboard updates
