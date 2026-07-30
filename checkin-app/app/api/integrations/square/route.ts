import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/validation";

export const runtime = "nodejs";

// Square webhook receiver (booking.created / booking.updated).
// Configure in the Square Developer Dashboard with this URL and put the
// webhook signature key in SQUARE_WEBHOOK_SIGNATURE_KEY (see
// docs/INTEGRATIONS.md). When a Square booking arrives for a known customer
// phone number, their open follow-ups advance to "Appointment Booked".

function verifySquareSignature(req: NextRequest, rawBody: string): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) return false;
  const signature = req.headers.get("x-square-hmacsha256-signature") ?? "";
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL ?? req.nextUrl.href;
  const expected = createHmac("sha256", key).update(notificationUrl + rawBody).digest("base64");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
    return NextResponse.json({ error: "Square integration is not configured." }, { status: 503 });
  }
  const rawBody = await req.text();
  if (!verifySquareSignature(req, rawBody)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: {
    type?: string;
    data?: { object?: { booking?: { customer_id?: string; start_at?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (event.type !== "booking.created" && event.type !== "booking.updated") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  // Square sends its own customer id; the phone number arrives via the
  // Retrieve Customer call in a fuller integration. Support both shapes:
  // booking.customer_id (opaque) or an enriched payload with phone_number.
  const booking = event.data?.object?.booking as
    | { customer_id?: string; start_at?: string; customer?: { phone_number?: string } }
    | undefined;
  const phoneRaw = booking?.customer?.phone_number;
  if (!phoneRaw) {
    // Nothing to match on — acknowledge so Square doesn't retry.
    return NextResponse.json({ ok: true, matched: false });
  }

  const customer = await prisma.customer.findUnique({ where: { phone: normalizePhone(phoneRaw) } });
  if (!customer) return NextResponse.json({ ok: true, matched: false });

  await prisma.followUp.updateMany({
    where: { customerId: customer.id, done: false, stage: { not: "DO_NOT_CONTACT" } },
    data: { stage: "BOOKED", nextAction: "Booked via Square", lastContactAt: new Date() },
  });
  await prisma.notification.create({
    data: {
      type: "booking",
      message: `${customer.firstName} booked an appointment via Square${booking?.start_at ? ` for ${booking.start_at}` : ""}.`,
    },
  });

  return NextResponse.json({ ok: true, matched: true });
}
