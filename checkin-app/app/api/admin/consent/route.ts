import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

const schema = z.object({
  customerId: z.string().min(1),
  channel: z.enum(["SMS", "EMAIL"]),
  granted: z.boolean(),
});

// Staff-recorded consent change (e.g. a customer calls to opt out).
// Appends a new record and marks prior records for the channel as superseded —
// the consent trail is append-only.
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession({ write: true });
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    const { customerId, channel, granted } = parsed.data;

    const now = new Date();
    await prisma.consentRecord.updateMany({
      where: { customerId, channel, revokedAt: null },
      data: { revokedAt: now },
    });
    await prisma.consentRecord.create({
      data: {
        customerId,
        channel,
        granted,
        wording: `Recorded by staff (${session.email}): customer ${granted ? "opted in to" : "withdrew consent for"} ${channel} marketing.`,
        source: "admin",
      },
    });
    await audit(session, granted ? "consent.grant" : "consent.withdraw", "customer", customerId, channel);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("consent record failed", err);
    return NextResponse.json({ error: "Failed to record consent." }, { status: 500 });
  }
}
