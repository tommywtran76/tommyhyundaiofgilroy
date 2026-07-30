import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

const patchSchema = z.object({
  notes: z.string().max(8000).optional(),
  tags: z.array(z.string().max(40)).max(30).optional(),
  estimatedValue: z.number().int().min(0).max(1_000_000).optional(),
  doNotContact: z.boolean().optional(),
  deletionRequested: z.literal(true).optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession({ write: true });
    const { id } = await ctx.params;
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

    const { tags, deletionRequested, ...rest } = parsed.data;
    await prisma.customer.update({
      where: { id },
      data: {
        ...rest,
        ...(tags ? { tags: JSON.stringify(tags) } : {}),
        ...(deletionRequested ? { deletionRequestedAt: new Date() } : {}),
      },
    });
    await audit(session, "customer.update", "customer", id, JSON.stringify(Object.keys(parsed.data)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("customer patch failed", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}

// Permanent deletion (customer deletion request) — owner only.
// Cascades to check-ins, consents, photos, and follow-ups.
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession({ owner: true });
    const { id } = await ctx.params;
    const customer = await prisma.customer.findUnique({ where: { id }, select: { phone: true } });
    if (!customer) return NextResponse.json({ error: "Not found." }, { status: 404 });

    await prisma.customer.delete({ where: { id } });
    // Log without personal data — just the entity id.
    await audit(session, "customer.delete", "customer", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("customer delete failed", err);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
