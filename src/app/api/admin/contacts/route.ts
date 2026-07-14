import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler } from "@/lib/api";

export const GET = adminHandler(async () => {
  const items = await db.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ contacts: items });
}, "contacts");
