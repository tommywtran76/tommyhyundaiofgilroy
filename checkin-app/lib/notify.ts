import { prisma } from "./db";
import { BUSINESS, serviceLabel } from "./services";

// Owner notification fan-out on every check-in:
//  1. Always: a Notification row (dashboard bell + front-desk sound).
//  2. Optional: SMS to the owner via Twilio (TWILIO_* env vars).
//  3. Optional: email to the owner via Resend (RESEND_API_KEY + OWNER_EMAIL).
//  4. Optional: outbound webhook (CHECKIN_WEBHOOK_URL) for Zapier/Make/CRM.
// External sends are best-effort: failures are logged, never surfaced to the
// customer, and never block the check-in.

export interface CheckInEvent {
  checkInId: string;
  customerId: string;
  firstName: string;
  lastName: string;
  visitType: string;
  services: string[];
  appointmentTime?: string | null;
  isFirstVisit: boolean;
  createdAt: Date;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: process.env.BUSINESS_TIMEZONE || "America/Los_Angeles",
  });
}

export function checkInMessage(ev: CheckInEvent): string {
  const service = ev.services.length ? serviceLabel(ev.services[0]) : "a visit";
  if (ev.visitType === "WALK_IN") {
    return `New walk-in lead: ${ev.firstName} is interested in ${service}.`;
  }
  return `${ev.firstName} has checked in for ${service} at ${formatTime(ev.createdAt)}.`;
}

export async function notifyCheckIn(ev: CheckInEvent): Promise<void> {
  const message = checkInMessage(ev);

  await prisma.notification.create({
    data: {
      type: ev.visitType === "WALK_IN" ? "walk-in" : "check-in",
      message,
      checkInId: ev.checkInId,
    },
  });

  // Fire-and-forget external notifications.
  await Promise.allSettled([
    sendOwnerSms(message),
    sendOwnerEmail(message, ev),
    sendWebhook(ev, message),
  ]);
}

async function sendOwnerSms(message: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.OWNER_NOTIFY_PHONE;
  if (!sid || !token || !from || !to) return;

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: from, To: to, Body: `${BUSINESS.name}: ${message}` }),
  });
  if (!res.ok) console.error("Twilio notify failed", res.status, await res.text());
}

async function sendOwnerEmail(message: string, ev: CheckInEvent): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  if (!apiKey || !to) return;

  const services = ev.services.map((s) => serviceLabel(s)).join(", ") || "—";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM_EMAIL || "checkin@aileennbeauty.com",
      to,
      subject: `Check-in: ${ev.firstName} ${ev.lastName}`,
      text: `${message}\n\nServices: ${services}\nVisit type: ${ev.visitType}\nFirst visit: ${ev.isFirstVisit ? "Yes" : "No"}\nAppointment time: ${ev.appointmentTime || "—"}`,
    }),
  });
  if (!res.ok) console.error("Email notify failed", res.status, await res.text());
}

async function sendWebhook(ev: CheckInEvent, message: string): Promise<void> {
  const url = process.env.CHECKIN_WEBHOOK_URL;
  if (!url) return;

  // Deliberately excludes health notes, signature, and photos.
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.CHECKIN_WEBHOOK_SECRET
        ? { "X-Webhook-Secret": process.env.CHECKIN_WEBHOOK_SECRET }
        : {}),
    },
    body: JSON.stringify({
      event: "checkin.created",
      message,
      checkInId: ev.checkInId,
      customerId: ev.customerId,
      firstName: ev.firstName,
      visitType: ev.visitType,
      services: ev.services,
      appointmentTime: ev.appointmentTime || null,
      isFirstVisit: ev.isFirstVisit,
      createdAt: ev.createdAt.toISOString(),
    }),
  });
  if (!res.ok) console.error("Webhook notify failed", res.status);
}
