# Supabase setup (production database)

The app talks to PostgreSQL through Prisma on the server — it does not use
Supabase client libraries, so setup is just "create a Postgres database and
point Prisma at it". Plain PostgreSQL (RDS, Neon, Railway…) works identically.

## 1. Create the project

1. https://supabase.com → **New project**.
2. Name: `aileens-beauty-checkin`. Region: **West US (North California)** —
   closest to Campbell/San Jose. Set a strong database password and save it.

## 2. Get the connection strings

Project → **Settings → Database → Connection string**:

- **Transaction pooler** (port 6543) → use as `DATABASE_URL`, append
  `?pgbouncer=true`:
  ```
  postgresql://postgres.<ref>:<password>@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- **Direct connection** (port 5432) → use as `DIRECT_URL` (migrations).

## 3. Create the schema

Option A (recommended — Prisma):

```bash
cd checkin-app
# switch provider to postgresql in prisma/schema.prisma (see DEPLOYMENT.md)
DATABASE_URL="<direct connection string>" npx prisma db push
DATABASE_URL="<direct connection string>" npm run seed
```

Option B (SQL editor): paste `supabase/migrations/0001_init.sql` into
Supabase → SQL Editor and run it, then run the seed as above.

## 4. Security notes

- Row Level Security is enabled default-deny by the migration; since the app
  connects with the `postgres` role via Prisma, no policies are needed. Never
  expose the Supabase `anon` key for these tables — the app doesn't use it.
- Keep both connection strings secret; they carry the database password.
- Backups: Supabase Dashboard → Database → Backups (daily included; PITR on
  Pro). Combine with the in-app owner backup (Settings → Data tools).

## 5. Photos at scale (optional, later)

Uploaded photos are currently stored in the database (base64) and served only
through the authenticated `/api/admin/photos/[id]` route, which keeps them
private with zero extra setup. If photo volume grows, move them to a
**private** Supabase Storage bucket and store the object path in the `Photo`
table instead — keep the bucket non-public and serve via signed URLs generated
server-side.
