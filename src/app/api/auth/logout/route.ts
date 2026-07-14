import { NextResponse } from "next/server";
import { clearSessionCookie, getSession, audit } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (session) await audit(session.sub, "LOGOUT", "auth", session.sub);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
