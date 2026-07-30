-- Aileen's Beauty check-in — PostgreSQL/Supabase schema.
-- Mirrors prisma/schema.prisma. Either run this in the Supabase SQL editor,
-- or (preferred) switch the Prisma datasource provider to "postgresql" and run
-- `npx prisma migrate dev --name init` / `npx prisma db push` instead.
-- Note: all access goes through the Next.js server with Prisma; Supabase
-- client-side APIs are not used, so keep Row Level Security default-deny.

create table "User" (
  "id" text primary key,
  "email" text not null unique,
  "name" text not null,
  "passwordHash" text not null,
  "role" text not null default 'STAFF',
  "active" boolean not null default true,
  "lastLoginAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table "Customer" (
  "id" text primary key,
  "firstName" text not null,
  "lastName" text not null,
  "phone" text not null unique,
  "email" text,
  "birthday" text,
  "preferredLanguage" text not null default 'en',
  "referralSource" text,
  "referralName" text,
  "firstVisitAt" timestamptz,
  "lastVisitAt" timestamptz,
  "totalVisits" integer not null default 0,
  "estimatedValue" integer not null default 0,
  "tags" text not null default '[]',
  "notes" text,
  "doNotContact" boolean not null default false,
  "deletionRequestedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table "CheckIn" (
  "id" text primary key,
  "customerId" text not null references "Customer"("id") on delete cascade,
  "visitType" text not null,
  "isFirstVisit" boolean not null default true,
  "language" text not null default 'en',
  "services" text not null default '[]',
  "otherService" text,
  "hasAppointment" text not null default 'NOT_SURE',
  "appointmentTime" text,
  "staffMember" text,
  "serviceBooked" text,
  "bookingHelp" text,
  "answers" text not null default '{}',
  "safetyNotes" text,
  "referralSource" text,
  "referralName" text,
  "signature" text,
  "status" text not null default 'WAITING',
  "waitEstimate" text,
  "staffNotes" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index "CheckIn_createdAt_idx" on "CheckIn"("createdAt");
create index "CheckIn_status_idx" on "CheckIn"("status");

create table "ConsentRecord" (
  "id" text primary key,
  "customerId" text not null references "Customer"("id") on delete cascade,
  "checkInId" text references "CheckIn"("id") on delete set null,
  "channel" text not null,
  "granted" boolean not null,
  "wording" text not null,
  "source" text not null default 'kiosk',
  "createdAt" timestamptz not null default now(),
  "revokedAt" timestamptz
);
create index "ConsentRecord_customerId_channel_idx" on "ConsentRecord"("customerId", "channel");

create table "Photo" (
  "id" text primary key,
  "customerId" text not null references "Customer"("id") on delete cascade,
  "checkInId" text references "CheckIn"("id") on delete set null,
  "mimeType" text not null,
  "data" text not null,
  "createdAt" timestamptz not null default now()
);

create table "FollowUp" (
  "id" text primary key,
  "customerId" text not null references "Customer"("id") on delete cascade,
  "stage" text not null default 'NEW_LEAD',
  "dueDate" timestamptz,
  "notes" text,
  "preferredContact" text,
  "estimatedValue" integer not null default 0,
  "lastContactAt" timestamptz,
  "nextAction" text,
  "done" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index "FollowUp_stage_done_idx" on "FollowUp"("stage", "done");

create table "MessageTemplate" (
  "id" text primary key,
  "name" text not null,
  "channel" text not null default 'SMS',
  "body" text not null,
  "createdAt" timestamptz not null default now()
);

create table "Notification" (
  "id" text primary key,
  "type" text not null,
  "message" text not null,
  "checkInId" text,
  "readAt" timestamptz,
  "createdAt" timestamptz not null default now()
);
create index "Notification_createdAt_idx" on "Notification"("createdAt");

create table "AuditLog" (
  "id" text primary key,
  "userId" text,
  "userEmail" text,
  "action" text not null,
  "entity" text,
  "entityId" text,
  "detail" text,
  "createdAt" timestamptz not null default now()
);
create index "AuditLog_createdAt_idx" on "AuditLog"("createdAt");

create table "Setting" (
  "key" text primary key,
  "value" text not null
);

-- Default-deny row level security: the app connects with the service/database
-- role via Prisma; anon/authenticated Supabase roles get nothing.
alter table "User" enable row level security;
alter table "Customer" enable row level security;
alter table "CheckIn" enable row level security;
alter table "ConsentRecord" enable row level security;
alter table "Photo" enable row level security;
alter table "FollowUp" enable row level security;
alter table "MessageTemplate" enable row level security;
alter table "Notification" enable row level security;
alter table "AuditLog" enable row level security;
alter table "Setting" enable row level security;
