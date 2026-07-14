import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody, parseJson } from "@/lib/api";
import { audit } from "@/lib/auth";

export const GET = adminHandler(async (ctx) => {
  const property = await db.property.findUnique({
    where: { id: ctx.params.id },
    include: { suburb: true, agent: true },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    property: {
      ...property,
      images: parseJson<string[]>(property.images, []),
      features: property.features.split(",").map((f) => f.trim()).filter(Boolean),
    },
  });
}, "properties");

export const PATCH = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const data: Record<string, unknown> = {};
  const fields = [
    "title","slug","description","address","suburbId","price","priceDisplay",
    "listingType","status","propertyType","bedrooms","bathrooms","carSpaces",
    "landSize","buildingSize","floorPlan","virtualTourUrl","videoUrl","agentId",
    "featured",
  ];
  for (const f of fields) if (f in b) data[f] = b[f];
  if ("features" in b)
    data.features = Array.isArray(b.features) ? (b.features as string[]).join(",") : String(b.features);
  if ("images" in b) data.images = JSON.stringify(b.images || []);

  const updated = await db.property.update({ where: { id: ctx.params.id }, data });
  await audit(ctx.session.sub, "UPDATE", "property", ctx.params.id, `Updated ${updated.title}`);
  return NextResponse.json({ property: updated });
}, "properties");

export const DELETE = adminHandler(async (ctx) => {
  await db.property.delete({ where: { id: ctx.params.id } });
  await audit(ctx.session.sub, "DELETE", "property", ctx.params.id, "Deleted property");
  return NextResponse.json({ ok: true });
}, "properties");
