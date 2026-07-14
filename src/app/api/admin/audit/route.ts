import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler } from "@/lib/api";

export const GET = adminHandler(async () => {
  const logs = await db.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
  return NextResponse.json({ logs });
}, "audit");
