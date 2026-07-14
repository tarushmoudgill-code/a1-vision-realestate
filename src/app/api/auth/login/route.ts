import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyPassword,
  setSessionCookie,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
  audit,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateKey = `${email}:${ip}`;
  const rl = checkRateLimit(rateKey);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rl.retryIn}s.` },
      { status: 429 }
    );
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    recordFailedAttempt(rateKey);
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    recordFailedAttempt(rateKey);
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  clearFailedAttempts(rateKey);
  await setSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "ADMIN" | "AGENT" | "PROPERTY_MANAGER" | "MARKETING",
    agentId: user.agentId,
  });
  await audit(user.id, "LOGIN", "auth", user.id, "User logged in");

  return NextResponse.json({
    user: {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      agentId: user.agentId,
    },
  });
}
