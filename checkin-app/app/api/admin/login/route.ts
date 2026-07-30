import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, verifyPassword, type Role } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

// Simple in-memory throttle: 5 failed attempts per email per 15 minutes.
// (Per-instance; for multi-region deployments use an upstream rate limiter.)
const failures = new Map<string, { count: number; resetAt: number }>();
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const entry = failures.get(email);
  if (entry && entry.count >= MAX_FAILURES && Date.now() < entry.resetAt) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && user.active && verifyPassword(password, user.passwordHash);

  if (!ok) {
    const cur = failures.get(email);
    failures.set(email, {
      count: cur && Date.now() < cur.resetAt ? cur.count + 1 : 1,
      resetAt: Date.now() + WINDOW_MS,
    });
    await audit(null, "login.failed", "user", undefined, email);
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  failures.delete(email);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  };
  const token = await createSessionToken(sessionUser);
  await audit(sessionUser, "login.success", "user", user.id);

  const res = NextResponse.json({ ok: true, name: user.name, role: user.role });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // cookie lifetime; the JWT inside enforces idle timeout
  });
  return res;
}
