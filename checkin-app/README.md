# Aileen’s Beauty — Guest Check-In & Lead Capture

A premium customer check-in and lead-capture web app for **Aileen’s Beauty**
(Campbell / San Jose, California · 650-305-8036 · www.aileennbeauty.com),
designed for an iPad at the front desk with a secure staff dashboard behind it.

Built with **Next.js 15 · TypeScript · Tailwind CSS 4 · Prisma** (SQLite for
local development, **Supabase/PostgreSQL** for production) and deployable to
**Vercel** as a responsive Progressive Web App.

> **Domains:** the main business website is **www.aileennbeauty.com**. The
> static site at this repository's root serves the
> **removal.aileennbeauty.com** landing pages (see `/CNAME`) and is separate
> from this app. Deploy the check-in app as its own Vercel project — a good
> home for it is a dedicated subdomain such as `checkin.aileennbeauty.com`.

## What’s inside

| Area | Route | Notes |
| --- | --- | --- |
| Guest kiosk | `/kiosk` (also `/`) | 8-screen flow: welcome → your info (with returning-guest lookup) → services → service-specific questions → how you heard about us → marketing consent → review + signature → confirmation. EN / Tiếng Việt / Español toggle, 60-second inactivity reset, data cleared after every submission. |
| Staff dashboard | `/admin` | Today’s check-ins, upcoming appointments, walk-in leads, consultations, customer directory + full profiles, marketing consent, follow-up tasks, reports, settings. |
| Legal pages | `/privacy`, `/terms`, `/sms-terms` | Linked from the consent screen. |
| Public API | `POST /api/checkin`, `POST /api/lookup` | The only unauthenticated endpoints; both validated. |
| Integration API | `/api/integrations/*` | Bearer-token feeds for Zapier/Make/CRM, Square webhook, Twilio inbound SMS. See `docs/INTEGRATIONS.md`. |

## Quick start (local)

```bash
cd checkin-app
npm install
# Point .env at a Postgres database (e.g. your Supabase project) —
# or for a zero-dependency run, switch prisma/schema.prisma to sqlite
# (see the comment at the top of that file), then:
npm run setup                 # creates .env, database tables, seed data
npm run dev
```

- Kiosk: http://localhost:3000/kiosk
- Dashboard: http://localhost:3000/admin — on an empty database the login
  page shows a one-time **Create Owner Account** screen; with seeded sample
  data, sign in with the credentials `npm run seed` prints (default
  `aileen@aileennbeauty.com` / `ChangeMe!2026` — **change this immediately**).

## Roles

| Role | Can |
| --- | --- |
| **Owner** | Everything: staff accounts, backups, permanent customer deletion, audit history |
| **Staff** / **Front Desk** | Day-to-day: statuses, notes, follow-ups, consent records, exports |
| **Read Only** | View everything, change nothing |

## Security & privacy design

- Admin sessions: signed HTTP-only cookies (scrypt-hashed passwords, JWT),
  **30-minute idle timeout with automatic logout**, login throttling, and an
  append-only **audit log** of staff actions.
- Customer phone numbers, emails, health notes, signatures, and photos are
  **never** exposed on public endpoints; photos are served only through an
  authenticated admin route.
- Marketing consent is **optional, un-prechecked, and stored append-only**
  with the exact wording, timestamp, and channel for every submission.
  STOP/START texts (via Twilio) update the trail automatically.
- Duplicate customers are prevented by unique normalized phone numbers;
  repeat check-ins update the same profile.
- Customers can update info, withdraw consent, get a copy of their data
  (per-customer JSON export), or request deletion (flag + owner-only
  permanent delete). Owner can download a full JSON backup.
- The kiosk is not a medical diagnostic system, and says so; safety questions
  are for service safety only.

## Documentation

- `docs/DEPLOYMENT.md` — Vercel deployment, environment variables
- `docs/SUPABASE_SETUP.md` — production database setup (or plain PostgreSQL)
- `docs/INTEGRATIONS.md` — Twilio, Square, Google Calendar, Gmail/Sheets,
  Mailchimp, Zapier/Make, webhook + API reference
- `docs/KIOSK_IPAD.md` — putting an iPad into kiosk mode (Guided Access)
- `docs/TEST_CHECKLIST.md` — manual test checklist (pre-launch)
- `.env.example` — environment variable template
- `supabase/migrations/0001_init.sql` — PostgreSQL DDL mirror of the schema

## Phased build

The app was built and committed in the four requested phases:
1. Database, welcome screen, check-in flow, confirmation, basic admin
2. Customer profiles, service-specific questions, lead follow-up, status tracking, reports
3. Notification fan-out and Square / Twilio / webhook / CRM integrations
4. Multilingual kiosk, staff roles, audit logs, legal pages, security hardening, docs
