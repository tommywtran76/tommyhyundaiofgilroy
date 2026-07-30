import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { integrationAuthorized, integrationEnabled } from "@/lib/integration-auth";
import { serviceLabel } from "@/lib/services";

export const runtime = "nodejs";

// Pull-style integration feed (Zapier / Make / Google Sheets sync / CRM).
// GET /api/integrations/checkins?since=ISO8601&limit=100
// Auth: Authorization: Bearer <INTEGRATION_API_KEY>
// Excludes health notes, signatures, and photos by design.
export async function GET(req: NextRequest) {
  if (!integrationEnabled()) {
    return NextResponse.json({ error: "Integrations are not configured." }, { status: 503 });
  }
  if (!integrationAuthorized(req)) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  const since = req.nextUrl.searchParams.get("since");
  const limit = Math.min(500, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 100));

  const checkIns = await prisma.checkIn.findMany({
    where: since && !Number.isNaN(Date.parse(since)) ? { createdAt: { gt: new Date(since) } } : undefined,
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, preferredLanguage: true } },
      consents: { select: { channel: true, granted: true } },
    },
  });

  return NextResponse.json({
    checkIns: checkIns.map((c) => ({
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      visitType: c.visitType,
      isFirstVisit: c.isFirstVisit,
      services: (JSON.parse(c.services || "[]") as string[]).map((s) => ({ key: s, label: serviceLabel(s) })),
      hasAppointment: c.hasAppointment,
      appointmentTime: c.appointmentTime,
      staffMember: c.staffMember,
      bookingHelp: c.bookingHelp,
      referralSource: c.referralSource,
      status: c.status,
      customer: c.customer,
      consent: {
        sms: c.consents.find((x) => x.channel === "SMS")?.granted ?? false,
        email: c.consents.find((x) => x.channel === "EMAIL")?.granted ?? false,
      },
    })),
    nextSince: checkIns.at(-1)?.createdAt.toISOString() ?? since ?? null,
  });
}
