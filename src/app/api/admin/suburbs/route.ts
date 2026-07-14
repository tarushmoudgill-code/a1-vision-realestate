import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody, parseJson } from "@/lib/api";
import { audit } from "@/lib/auth";

export const GET = adminHandler(async () => {
  const suburbs = await db.suburb.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({
    suburbs: suburbs.map((s) => ({
      ...s,
      demographics: parseJson(s.demographics, {}),
      amenities: parseJson<string[]>(s.amenities, []),
    })),
  });
}, "suburbs");

export const POST = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const created = await db.suburb.create({
    data: {
      name: String(b.name || ""),
      state: String(b.state || "VIC"),
      postcode: String(b.postcode || ""),
      description: String(b.description || ""),
      medianPrice: Number(b.medianPrice) || 0,
      medianRent: Number(b.medianRent) || 0,
      growthRate: Number(b.growthRate) || 0,
      population: Number(b.population) || 0,
      demographics: JSON.stringify(b.demographics || {}),
      amenities: JSON.stringify(b.amenities || []),
      lifestyle: String(b.lifestyle || ""),
      image: String(b.image || ""),
      featured: Boolean(b.featured),
    },
  });
  await audit(ctx.session.sub, "CREATE", "suburb", created.id, `Created suburb ${created.name}`);
  return NextResponse.json({ suburb: created });
}, "suburbs");
