import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!s) {
    s = await db.siteSettings.create({ data: { id: "singleton" } });
  }
  return NextResponse.json({ settings: s });
}
