import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const property = await db.property.findUnique({
    where: { slug },
    include: { suburb: true, agent: true },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // increment views
  await db.property.update({
    where: { id: property.id },
    data: { views: { increment: 1 } },
  });

  const similar = await db.property.findMany({
    where: {
      id: { not: property.id },
      OR: [
        { suburbId: property.suburbId },
        { propertyType: property.propertyType },
      ],
    },
    include: { suburb: true, agent: true },
    take: 3,
  });

  return NextResponse.json({
    property: {
      ...property,
      images: parseJson<string[]>(property.images, []),
      features: property.features.split(",").map((f) => f.trim()).filter(Boolean),
    },
    similar: similar.map((p) => ({
      ...p,
      images: parseJson<string[]>(p.images, []),
    })),
  });
}
