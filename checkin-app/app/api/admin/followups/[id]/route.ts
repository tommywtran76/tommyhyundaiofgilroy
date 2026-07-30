import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { FOLLOW_UP_STAGES } from "@/lib/services";

export const runtime = "nodejs";

const patchSchema = z.object({
  stage: z.enum(FOLLOW_UP_STAGES).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(4000).optional(),
  preferredContact: z.enum(["call", "text", "email", ""]).optional(),
  estimatedValue: z.number().int().min(0).max(1_000_000).optional(),
  lastContactAt: z.string().datetime().nullable().optional(),
  nextAction: z.string().max(500).optional(),
  done: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession({ write: true });
    const { id } = await ctx.params;
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

    const { dueDate, lastContactAt, ...rest } = parsed.data;
    await prisma.followUp.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(lastContactAt !== undefined
          ? { lastContactAt: lastContactAt ? new Date(lastContactAt) : null }
          : {}),
      },
    });

    // Keep the customer's DO_NOT_CONTACT flag in sync with the stage.
    if (parsed.data.stage === "DO_NOT_CONTACT") {
      const f = await prisma.followUp.findUnique({ where: { id }, select: { customerId: true } });
      if (f) await prisma.customer.update({ where: { id: f.customerId }, data: { doNotContact: true } });
    }

    await audit(session, "followup.update", "followUp", id, JSON.stringify(Object.keys(parsed.data)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("followup patch failed", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
