import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { CHECKIN_STATUSES } from "@/lib/services";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(CHECKIN_STATUSES).optional(),
  waitEstimate: z.string().max(120).optional(),
  staffNotes: z.string().max(4000).optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession({ write: true });
    const { id } = await ctx.params;
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const checkIn = await prisma.checkIn.update({ where: { id }, data: parsed.data });
    await audit(session, "checkin.update", "checkIn", id, JSON.stringify(parsed.data));
    return NextResponse.json({
      ok: true,
      checkIn: { id: checkIn.id, status: checkIn.status, waitEstimate: checkIn.waitEstimate },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("checkin patch failed", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
