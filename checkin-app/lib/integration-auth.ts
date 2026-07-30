import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

// Bearer-token auth for machine-to-machine integration endpoints
// (Zapier, Make, a future CRM). Set INTEGRATION_API_KEY to enable them;
// when unset, every integration endpoint returns 503.

export function integrationAuthorized(req: NextRequest): boolean {
  const expected = process.env.INTEGRATION_API_KEY;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function integrationEnabled(): boolean {
  return Boolean(process.env.INTEGRATION_API_KEY);
}
