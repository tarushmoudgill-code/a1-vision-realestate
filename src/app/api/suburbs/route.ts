import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/api";

export async function GET() {
  const suburbs = await db.suburb.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({
    suburbs: suburbs.map((s) => ({
      ...s,
      demographics: parseJson(s.demographics, {}),
      amenities: parseJson<string[]>(s.amenities, []),
    })),
  });
}
