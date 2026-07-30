import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  channel: z.enum(["SMS", "EMAIL"]),
  body: z.string().trim().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession({ write: true });
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    const template = await prisma.messageTemplate.create({ data: parsed.data });
    await audit(session, "template.create", "template", template.id, parsed.data.name);
    return NextResponse.json({ ok: true, id: template.id });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Create failed." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireSession({ write: true });
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
    await prisma.messageTemplate.delete({ where: { id } });
    await audit(session, "template.delete", "template", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
