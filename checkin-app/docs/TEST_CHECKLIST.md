# Pre-launch test checklist

Run through this list before going live and after significant changes.
API-level items can be verified with `curl`; UI items on an iPad + a phone.

## Kiosk — new customer

- [ ] Welcome screen shows all five visit-type buttons and the privacy note
- [ ] New check-in with valid info completes through all screens
- [ ] Phone rejected unless a valid 10-digit US number (e.g. `12345` fails)
- [ ] Email rejected when malformed (e.g. `not-an-email`); empty email allowed
- [ ] First/last name required; birthday optional
- [ ] Multiple services can be selected
- [ ] Removal service shows tattoo questions incl. photo upload
- [ ] Facial service shows skin-concern questions
- [ ] Body scrub requires the women-only confirmation before continuing
- [ ] Allergy/safety question appears for every service with the disclaimer
- [ ] "Friend or Family" referral asks who referred
- [ ] Consent boxes start unchecked; check-in completes with both declined
- [ ] Review screen shows all data; Edit jumps back to the right screen
- [ ] Signature can be drawn and cleared
- [ ] Confirmation shows first name + service, returns to welcome after 15 s

## Kiosk — returning customer & privacy

- [ ] "First visit? No" → phone lookup pre-fills profile ("Welcome back")
- [ ] Unknown phone → "couldn't find" message, manual entry works
- [ ] Same phone number checked in twice → one customer, visit count +1 (no duplicate)
- [ ] After submission, going back to the kiosk shows no previous customer data
- [ ] 60 s of inactivity mid-flow → "still there?" → auto-reset
- [ ] Language toggle: full flow in Tiếng Việt and Español renders translated

## Admin

- [ ] `/admin` redirects to login when signed out; wrong password rejected
- [ ] 6+ failed logins throttled (429)
- [ ] New check-in appears on Today's Check-Ins (bell + chime on the open dashboard)
- [ ] Walk-in shows "New walk-in lead …" notification wording
- [ ] One-tap status change persists (Waiting → In Service → Completed)
- [ ] Wait estimate saves
- [ ] Customer profile shows history, consents, photos (photo loads only when signed in — `/api/admin/photos/<id>` unauthenticated returns 401)
- [ ] Follow-up stages, dates, values editable; board groups by stage
- [ ] Template copy button fills [First Name] and [Service]
- [ ] Consent page lists only currently opted-in customers; staff-recorded withdrawal moves them off the list
- [ ] Reports show sensible numbers; date filter works
- [ ] CSV exports download and open in Excel (Vietnamese names render correctly)
- [ ] Read Only account: no edit controls / writes rejected (403)
- [ ] Owner-only: user management, backup, permanent delete hidden from staff
- [ ] Deletion request: mark on profile → banner appears; owner delete removes customer and their check-ins/photos/consents
- [ ] Per-customer data export downloads JSON
- [ ] Idle 30 min → automatically signed out
- [ ] Audit history records logins, status changes, exports, deletions

## Responsive / devices

- [ ] iPad landscape + portrait: kiosk comfortable, large tap targets
- [ ] iPhone/Android: kiosk and dashboard usable, no horizontal scroll
- [ ] Desktop: dashboard sidebar layout

## Integrations (if configured)

- [ ] Check-in triggers owner SMS (Twilio) and/or email (Resend)
- [ ] Check-in POSTs to `CHECKIN_WEBHOOK_URL` (verify in Zapier/Make history)
- [ ] `GET /api/integrations/checkins` with wrong/missing bearer token → 401/503
- [ ] Texting STOP to the Twilio number → consent withdrawn + notification
- [ ] Square test webhook → signature verified, lead advances to Booked
