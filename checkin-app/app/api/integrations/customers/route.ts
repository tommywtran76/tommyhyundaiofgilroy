import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { integrationAuthorized, integrationEnabled } from "@/lib/integration-auth";

export const runtime = "nodejs";

// Customer sync feed for CRM / Mailchimp-style tools.
// GET /api/integrations/customers?updatedSince=ISO8601&marketing=sms|email
// Auth: Authorization: Bearer <INTEGRATION_API_KEY>
// With ?marketing=, only customers with an active opt-in for that channel are
// returned — safe to pipe into an email/SMS platform.
export async function GET(req: NextRequest) {
  if (!integrationEnabled()) {
    return NextResponse.json({ error: "Integrations are not configured." }, { status: 503 });
  }
  if (!integrationAuthorized(req)) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  const updatedSince = req.nextUrl.searchParams.get("updatedSince");
  const marketing = req.nextUrl.searchParams.get("marketing");

  const customers = await prisma.customer.findMany({
    where: {
      deletionRequestedAt: null,
      ...(marketing ? { doNotContact: false } : {}),
      ...(updatedSince && !Number.isNaN(Date.parse(updatedSince))
        ? { updatedAt: { gt: new Date(updatedSince) } }
        : {}),
    },
    orderBy: { updatedAt: "asc" },
    take: 500,
    include: { consents: { where: { revokedAt: null }, select: { channel: true, granted: true } } },
  });

  const filtered = marketing
    ? customers.filter((c) =>
        c.consents.some((r) => r.channel === marketing.toUpperCase() && r.granted),
      )
    : customers;

  return NextResponse.json({
    customers: filtered.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      email: c.email,
      birthday: c.birthday,
      preferredLanguage: c.preferredLanguage,
      referralSource: c.referralSource,
      totalVisits: c.totalVisits,
      firstVisitAt: c.firstVisitAt?.toISOString() ?? null,
      lastVisitAt: c.lastVisitAt?.toISOString() ?? null,
      tags: JSON.parse(c.tags || "[]"),
      smsConsent: c.consents.find((r) => r.channel === "SMS")?.granted ?? false,
      emailConsent: c.consents.find((r) => r.channel === "EMAIL")?.granted ?? false,
      updatedAt: c.updatedAt.toISOString(),
    })),
  });
}
