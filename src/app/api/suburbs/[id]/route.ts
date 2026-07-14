import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const suburb = await db.suburb.findUnique({ where: { id } });
  if (!suburb) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const listings = await db.property.findMany({
    where: { suburbId: id, status: { not: "WITHDRAWN" } },
    include: { agent: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return NextResponse.json({
    suburb: {
      ...suburb,
      demographics: parseJson(suburb.demographics, {}),
      amenities: parseJson<string[]>(suburb.amenities, []),
    },
    listings: listings.map((p) => ({
      ...p,
      images: parseJson<string[]>(p.images, []),
    })),
  });
}
