import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lookupSchema, normalizePhone } from "@/lib/validation";

export const runtime = "nodejs";

// Returning-customer lookup for the kiosk. The caller must already know the
// full phone number, and the response contains only the fields the kiosk form
// pre-fills — no visit history, notes, photos, or consent data.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { phone: normalizePhone(parsed.data.phone) },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      birthday: true,
      preferredLanguage: true,
      deletionRequestedAt: true,
    },
  });

  if (!customer || customer.deletionRequestedAt) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    birthday: customer.birthday,
    preferredLanguage: customer.preferredLanguage,
  });
}
