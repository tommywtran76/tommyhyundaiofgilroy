import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/validation";

export const runtime = "nodejs";

// Twilio inbound SMS webhook. Twilio's Advanced Opt-Out handles STOP/START
// delivery blocking at the carrier level; this endpoint mirrors those
// keywords into the consent trail so the dashboard always reflects reality.
// Configure as the "A message comes in" webhook for the Twilio number.

const STOP_WORDS = new Set(["stop", "stopall", "unsubscribe", "cancel", "end", "quit"]);
const START_WORDS = new Set(["start", "yes", "unstop"]);

function verifyTwilioSignature(req: NextRequest, params: URLSearchParams): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return false;
  const signature = req.headers.get("x-twilio-signature") ?? "";
  const url = process.env.TWILIO_WEBHOOK_URL ?? req.nextUrl.href;
  // Twilio signature: URL + params sorted by key, HMAC-SHA1, base64.
  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const data = url + sorted.map(([k, v]) => k + v).join("");
  const expected = createHmac("sha1", token).update(data).digest("base64");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!process.env.TWILIO_AUTH_TOKEN) {
    return NextResponse.json({ error: "Twilio integration is not configured." }, { status: 503 });
  }
  const bodyText = await req.text();
  const params = new URLSearchParams(bodyText);
  if (!verifyTwilioSignature(req, params)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const from = params.get("From") ?? "";
  const body = (params.get("Body") ?? "").trim().toLowerCase();
  const phone = normalizePhone(from);

  const customer = phone ? await prisma.customer.findUnique({ where: { phone } }) : null;

  if (customer && (STOP_WORDS.has(body) || START_WORDS.has(body))) {
    const granted = START_WORDS.has(body);
    const now = new Date();
    await prisma.consentRecord.updateMany({
      where: { customerId: customer.id, channel: "SMS", revokedAt: null },
      data: { revokedAt: now },
    });
    await prisma.consentRecord.create({
      data: {
        customerId: customer.id,
        channel: "SMS",
        granted,
        wording: `Customer texted "${body.toUpperCase()}" to the business number.`,
        source: "sms-keyword",
      },
    });
    if (!granted) {
      await prisma.customer.update({ where: { id: customer.id }, data: { doNotContact: true } });
    }
    await prisma.notification.create({
      data: {
        type: "consent",
        message: `${customer.firstName} ${granted ? "re-subscribed to" : "unsubscribed from"} SMS by texting ${body.toUpperCase()}.`,
      },
    });
  }

  // Empty TwiML response — Twilio's own opt-out reply handles the confirmation.
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { "Content-Type": "text/xml" },
  });
}
