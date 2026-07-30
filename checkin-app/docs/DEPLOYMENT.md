# Deploying to Vercel

## 1. Prerequisites

- A [Vercel](https://vercel.com) account (Hobby is fine to start).
- A production database — follow `docs/SUPABASE_SETUP.md` first.
- This repository pushed to GitHub.

## 2. Create the database schema

The app ships pointed at PostgreSQL. Create the tables once, either way:

- **No terminal needed:** open Supabase → SQL Editor → paste the contents of
  `supabase/migrations/0001_init.sql` → Run.
- **With a terminal:** `cd checkin-app && npx prisma db push` (with
  `DATABASE_URL`/`DIRECT_URL` set in `.env`). Optionally `npm run seed` for
  sample data.

No seed is required for production: on first visit, `/admin` shows a one-time
**Create Owner Account** screen (it disappears as soon as any account exists).

## 3. Create the Vercel project

1. Vercel → **Add New → Project** → import the GitHub repository.
2. Set **Root Directory** to `checkin-app`.
3. Framework preset: **Next.js** (auto-detected); the default build command
   is fine. `prisma generate` runs automatically via the `postinstall` script.

## 4. Environment variables

In Vercel → Project → Settings → Environment Variables, add (see
`.env.example` for the full annotated list):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Supabase **pooled** connection string (port 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | ✅ (with pooler) | Supabase direct connection string (port 5432) — used by migrations |
| `AUTH_SECRET` | ✅ | `openssl rand -hex 32` |
| `BUSINESS_TIMEZONE` | recommended | `America/Los_Angeles` |
| `SESSION_IDLE_MINUTES` | optional | default 30 |
| `TWILIO_*`, `OWNER_NOTIFY_PHONE` | optional | owner SMS notifications |
| `RESEND_API_KEY`, `OWNER_EMAIL` | optional | owner email notifications |
| `CHECKIN_WEBHOOK_URL`, `CHECKIN_WEBHOOK_SECRET` | optional | Zapier/Make/CRM push |
| `INTEGRATION_API_KEY` | optional | enables `/api/integrations/*` pull feeds |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | optional | Square booking webhook |

## 5. Deploy & verify

1. Deploy. Vercel serves everything over HTTPS automatically (encrypted
   connections requirement).
2. Visit `https://<project>.vercel.app/admin/login` — sign in, then
   **immediately change the seeded owner password** in Settings and delete or
   deactivate any sample accounts.
3. Visit `/kiosk` on the iPad and follow `docs/KIOSK_IPAD.md`.
4. Optionally add a custom domain (e.g. `checkin.aileennbeauty.com`) in
   Vercel → Domains.

## 6. Ongoing

- **Backups**: Supabase runs daily backups (paid plans add point-in-time
  recovery). The owner can also download a full JSON backup from
  Settings → Data tools at any time.
- **Error logging**: runtime errors appear in Vercel → Project → Logs.
  Server code logs failures with `console.error`, which lands there.
- **Updates**: pushing to the connected branch redeploys automatically.
