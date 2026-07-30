import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

const createSchema = z.object({
  customerId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession({ write: true });
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

    const followUp = await prisma.followUp.create({
      data: { customerId: parsed.data.customerId, stage: "NEW_LEAD", dueDate: new Date() },
    });
    await audit(session, "followup.create", "followUp", followUp.id);
    return NextResponse.json({ ok: true, id: followUp.id });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("followup create failed", err);
    return NextResponse.json({ error: "Create failed." }, { status: 500 });
  }
}
