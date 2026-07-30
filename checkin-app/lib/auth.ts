import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { prisma } from "./db";

export const ROLES = ["OWNER", "STAFF", "FRONT_DESK", "READ_ONLY"] as const;
export type Role = (typeof ROLES)[number];

// Roles allowed to modify data. READ_ONLY can only view.
const WRITE_ROLES: Role[] = ["OWNER", "STAFF", "FRONT_DESK"];
// Roles allowed to manage users, settings, exports, and deletion requests.
const ADMIN_ROLES: Role[] = ["OWNER"];

export const SESSION_COOKIE = "ab_session";
const IDLE_MINUTES = Number(process.env.SESSION_IDLE_MINUTES || 30);

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set to a long random string.");
  }
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${IDLE_MINUTES}m`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: (payload.name as string) ?? "",
      role: (payload.role as Role) ?? "READ_ONLY",
    };
  } catch {
    return null;
  }
}

/** Read + verify the session cookie. Returns null when not signed in or expired. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await verifySessionToken(token);
  if (!user) return null;
  // Ensure the account still exists and is active (revocation).
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !dbUser.active) return null;
  return { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role as Role };
}

export function canWrite(role: Role): boolean {
  return WRITE_ROLES.includes(role);
}

export function isOwner(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

/** For API routes: returns the session or throws a Response-shaped error. */
export async function requireSession(opts?: { write?: boolean; owner?: boolean }) {
  const session = await getSession();
  if (!session) throw new AuthError(401, "Not signed in.");
  if (opts?.owner && !isOwner(session.role)) throw new AuthError(403, "Owner access required.");
  if (opts?.write && !canWrite(session.role)) throw new AuthError(403, "Read-only account.");
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
