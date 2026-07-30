import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, hashPassword, requireSession, ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

const createSchema = z.object({
  email: z.string().email().max(120),
  name: z.string().trim().min(1).max(80),
  password: z.string().min(10).max(200),
  role: z.enum(ROLES),
});

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80).optional(),
  password: z.string().min(10).max(200).optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession({ owner: true });
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Passwords must be at least 10 characters." },
        { status: 400 },
      );
    }
    const { email, name, password, role } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });

    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), name, role, passwordHash: hashPassword(password) },
    });
    await audit(session, "user.create", "user", user.id, `${email} (${role})`);
    return NextResponse.json({ ok: true, id: user.id });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("user create failed", err);
    return NextResponse.json({ error: "Create failed." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession({ owner: true });
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    const { id, password, ...rest } = parsed.data;

    // An owner cannot deactivate or demote themselves — prevents lockout.
    if (id === session.id && (rest.active === false || (rest.role && rest.role !== "OWNER"))) {
      return NextResponse.json({ error: "You cannot demote or deactivate your own account." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { ...rest, ...(password ? { passwordHash: hashPassword(password) } : {}) },
    });
    await audit(session, "user.update", "user", id, JSON.stringify(Object.keys(rest).concat(password ? ["password"] : [])));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("user patch failed", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
