import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const GET = adminHandler(async () => {
  const items = await db.inspection.findMany({
    orderBy: { createdAt: "desc" },
    include: { property: { include: { suburb: true } }, agent: true },
  });
  return NextResponse.json({ inspections: items });
}, "inspections");
