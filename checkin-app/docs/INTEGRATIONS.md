# Integrations

Everything is configured with environment variables (see `.env.example`).
Settings → Integrations in the dashboard shows what is currently active.
A hard rule baked into every path below: **promotional messages are only ever
sent to customers with a recorded, current opt-in for that channel.**

## Twilio (SMS)

Used for (a) texting the owner when a guest checks in and (b) recording
STOP/START replies in the consent trail.

1. Buy a local number at https://twilio.com (Messaging-capable). For
   promotional traffic, complete A2P 10DLC brand/campaign registration.
2. Set env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
   `TWILIO_FROM_NUMBER`, and `OWNER_NOTIFY_PHONE` (e.g. `+16503058036`).
3. Inbound webhook: in the Twilio console, set the number's **"A message
   comes in"** webhook to
   `https://<your-domain>/api/integrations/twilio/inbound` (HTTP POST) and set
   `TWILIO_WEBHOOK_URL` to that exact URL. Enable Twilio's **Advanced
   Opt-Out** so carriers handle STOP confirmations; this endpoint mirrors the
   keywords into the dashboard's consent records and flags Do Not Contact.

## Square

When a customer books through Square Appointments, their open follow-ups
advance to **Appointment Booked** and the dashboard is notified.

1. https://developer.squareup.com → create an application.
2. Webhooks → add subscription for `booking.created` and `booking.updated`
   pointing at `https://<your-domain>/api/integrations/square`.
3. Copy the **Signature Key** into `SQUARE_WEBHOOK_SIGNATURE_KEY` and set
   `SQUARE_WEBHOOK_NOTIFICATION_URL` to the exact webhook URL.

Matching uses the customer's phone number when present in the payload; for a
deeper integration (fetching the Square customer to resolve the phone), add a
Square access token and a Retrieve Customer call in
`app/api/integrations/square/route.ts` — the TODO is isolated there.

## Zapier / Make (Google Sheets, Gmail, Google Calendar, Mailchimp, CRM)

Two building blocks cover all of these without per-service code:

**Push (webhook)** — set `CHECKIN_WEBHOOK_URL` to a Zapier "Catch Hook" / Make
webhook. Every check-in POSTs JSON (name, visit type, services, appointment
time — never health notes, signatures, or photos). Optional
`CHECKIN_WEBHOOK_SECRET` is sent as an `X-Webhook-Secret` header. From there:

- **Google Sheets**: Zap → "Create Spreadsheet Row" (live check-in log).
- **Gmail**: Zap → "Send Email" for arrival notifications.
- **Google Calendar**: Zap filter `hasAppointment = YES` → "Create Detailed
  Event" using `appointmentTime`.

**Pull (REST feeds)** — set `INTEGRATION_API_KEY` (`openssl rand -hex 32`),
then call with `Authorization: Bearer <key>`:

- `GET /api/integrations/checkins?since=<ISO8601>&limit=100` — incremental
  check-in feed (returns `nextSince` for cursoring).
- `GET /api/integrations/customers?updatedSince=<ISO8601>` — customer sync.
- `GET /api/integrations/customers?marketing=email` — **only customers with a
  current email opt-in**; safe to sync into Mailchimp. Use `?marketing=sms`
  for an SMS platform. Honor unsubscribes by re-syncing regularly.

A future CRM can use the same two mechanisms (webhook push + REST pull).

## Email notifications (Resend)

Owner notification emails use https://resend.com (simple API, generous free
tier). Set `RESEND_API_KEY`, `OWNER_EMAIL`, and optionally
`NOTIFY_FROM_EMAIL` (verify the domain in Resend for best deliverability).

## Website (www.aileennbeauty.com)

Link "Check in" from the site to the deployed kiosk URL, or embed the check-in
on a dedicated page. The kiosk is a normal responsive web page and works on
phones — useful for "check in from your car".
