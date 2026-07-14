import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler } from "@/lib/api";

export const GET = adminHandler(async () => {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { property: { include: { suburb: true } }, agent: true },
  });
  return NextResponse.json({ leads });
}, "leads");
