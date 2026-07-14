import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });
  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user || !user.active) return NextResponse.json({ user: null });
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
