import { NextResponse } from "next/server";
import { getSession, SESSION_COOKIE } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (session) await audit(session, "logout", "user", session.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
