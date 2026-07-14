import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody, parseJson } from "@/lib/api";
import { audit } from "@/lib/auth";

export const GET = adminHandler(async () => {
  const properties = await db.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { suburb: true, agent: true },
  });
  return NextResponse.json({
    properties: properties.map((p) => ({
      ...p,
      images: parseJson<string[]>(p.images, []),
      features: p.features.split(",").map((f) => f.trim()).filter(Boolean),
    })),
  });
}, "properties");

export const POST = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const slug = String(b.slug || slugify(String(b.title || "")) + "-" + rand());
  const created = await db.property.create({
    data: {
      title: String(b.title || ""),
      slug,
      description: String(b.description || ""),
      address: String(b.address || ""),
      suburbId: String(b.suburbId || ""),
      price: Number(b.price) || 0,
      priceDisplay: String(b.priceDisplay || ""),
      listingType: String(b.listingType || "SALE"),
      status: String(b.status || "ACTIVE"),
      propertyType: String(b.propertyType || "House"),
      bedrooms: Number(b.bedrooms) || 0,
      bathrooms: Number(b.bathrooms) || 0,
      carSpaces: Number(b.carSpaces) || 0,
      landSize: Number(b.landSize) || 0,
      buildingSize: Number(b.buildingSize) || 0,
      features: Array.isArray(b.features) ? (b.features as string[]).join(",") : String(b.features || ""),
      images: JSON.stringify(b.images || []),
      floorPlan: b.floorPlan ? String(b.floorPlan) : null,
      virtualTourUrl: b.virtualTourUrl ? String(b.virtualTourUrl) : null,
      videoUrl: b.videoUrl ? String(b.videoUrl) : null,
      agentId: String(b.agentId || ""),
      featured: Boolean(b.featured),
    },
  });
  await audit(ctx.session.sub, "CREATE", "property", created.id, `Created ${created.title}`);
  return NextResponse.json({ property: created });
}, "properties");

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function rand() {
  return Math.random().toString(36).slice(2, 6);
}
