import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

// "Copy of my information" export for customer data requests (CCPA-style).
// Returns everything stored about the customer as a JSON download.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        checkIns: true,
        consents: true,
        followUps: true,
        photos: { select: { id: true, mimeType: true, createdAt: true } },
      },
    });
    if (!customer) return NextResponse.json({ error: "Not found." }, { status: 404 });

    await audit(session, "customer.export", "customer", id);

    const body = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        business: "Aileen's Beauty",
        customer: {
          ...customer,
          tags: JSON.parse(customer.tags || "[]"),
          checkIns: customer.checkIns.map((c) => ({
            ...c,
            services: JSON.parse(c.services || "[]"),
            answers: JSON.parse(c.answers || "{}"),
            signature: c.signature ? "(signature image on file)" : null,
          })),
          photos: customer.photos.map((p) => ({ ...p, note: "photo on file" })),
        },
      },
      null,
      2,
    );

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="customer-data-${id}.json"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("customer export failed", err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
