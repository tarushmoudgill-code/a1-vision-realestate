import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "ah_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "ai-homes-dev-secret-change-in-production-9f2a";
const SESSION_DAYS = 7;

export type Role = "ADMIN" | "AGENT" | "PROPERTY_MANAGER" | "MARKETING" | "DEVELOPER";

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  agentId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: `${SESSION_DAYS}d` });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const cookieStore = await cookies();
  const token = signToken(payload);
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// In-memory rate limiting for failed logins (per IP / email)
const failedAttempts = new Map<string, { count: number; last: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;

export function checkRateLimit(key: string): { allowed: boolean; retryIn: number } {
  const entry = failedAttempts.get(key);
  if (!entry) return { allowed: true, retryIn: 0 };
  const elapsed = Date.now() - entry.last;
  if (elapsed > WINDOW_MS) {
    failedAttempts.delete(key);
    return { allowed: true, retryIn: 0 };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryIn: Math.ceil((WINDOW_MS - elapsed) / 1000) };
  }
  return { allowed: true, retryIn: 0 };
}

export function recordFailedAttempt(key: string) {
  const entry = failedAttempts.get(key) ?? { count: 0, last: Date.now() };
  entry.count += 1;
  entry.last = Date.now();
  failedAttempts.set(key, entry);
}

export function clearFailedAttempts(key: string) {
  failedAttempts.delete(key);
}

// Role-based access helpers
const ROLE_ACCESS: Record<Role, string[]> = {
  ADMIN: ["*"],
  DEVELOPER: ["*"],
  AGENT: [
    "dashboard",
    "properties",
    "inspections",
    "leads",
    "customers",
    "blog",
    "testimonials",
    "gallery",
    "contacts",
    "reports",
    "suburbs",
    "audit",
    "profile",
  ],
  PROPERTY_MANAGER: [
    "dashboard",
    "properties",
    "inspections",
    "leads",
    "customers",
    "reports",
    "profile",
  ],
  MARKETING: [
    "dashboard",
    "blog",
    "testimonials",
    "gallery",
    "contacts",
    "suburbs",
    "reports",
    "profile",
  ],
};

export function canAccess(role: Role, section: string): boolean {
  const access = ROLE_ACCESS[role] ?? [];
  return access.includes("*") || access.includes(section);
}

export async function requireAuth(section?: string): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (section && !canAccess(session.role as Role, section)) {
    throw new Error("FORBIDDEN");
  }
  // Ensure user still active
  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user || !user.active) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function audit(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  detail = ""
) {
  try {
    await db.auditLog.create({
      data: { userId, action, entity, entityId, detail },
    });
  } catch {
    // non-fatal
  }
}
