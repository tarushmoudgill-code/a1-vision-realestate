import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/api";

export async function GET() {
  const services = await db.service.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({
    services: services.map((s) => ({
      ...s,
      process: parseJson(s.process, []),
      included: parseJson(s.included, []),
    })),
  });
}
