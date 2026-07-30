import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSessionToken, hashPassword, SESSION_COOKIE } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

// First-run setup: while the app has zero staff accounts, the login page
// offers a one-time "create owner account" form backed by this endpoint.
// The moment any user exists, both methods refuse — after that, accounts are
// only created by an owner from Settings.

export async function GET() {
  const count = await prisma.user.count();
  return NextResponse.json({ needed: count === 0 });
}

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(10).max(200),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in every field. Passwords need at least 10 characters." },
      { status: 400 },
    );
  }

  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json(
      { error: "Setup has already been completed. Please sign in." },
      { status: 403 },
    );
  }

  const { name, email, password } = parsed.data;
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      role: "OWNER",
      passwordHash: hashPassword(password),
      lastLoginAt: new Date(),
    },
  });

  const sessionUser = { id: user.id, email: user.email, name: user.name, role: "OWNER" as const };
  await audit(sessionUser, "bootstrap.owner-created", "user", user.id, user.email);

  const token = await createSessionToken(sessionUser);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
