import { NextResponse } from "next/server";
import { createSessionToken, getSession, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

// Sliding session: the client calls this while the user is active so the
// short-lived session token is renewed. Idle users expire automatically.
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const token = await createSessionToken(session);
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
