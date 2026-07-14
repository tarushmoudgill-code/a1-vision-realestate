import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const listingType = url.searchParams.get("listingType"); // SALE | RENT | SOLD | AUCTION | NEW | OFFMARKET | PROJECT
  const propertyType = url.searchParams.get("propertyType");
  const suburbId = url.searchParams.get("suburbId");
  const suburbName = url.searchParams.get("suburb");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const beds = url.searchParams.get("beds");
  const baths = url.searchParams.get("baths");
  const cars = url.searchParams.get("cars");
  const featured = url.searchParams.get("featured");
  const q = url.searchParams.get("q");
  const sort = url.searchParams.get("sort") || "newest";
  const limit = parseInt(url.searchParams.get("limit") || "0") || undefined;

  const where: Record<string, unknown> = {};
  if (listingType) where.listingType = listingType;
  if (propertyType) where.propertyType = propertyType;
  if (suburbId) where.suburbId = suburbId;
  if (featured === "true") where.featured = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseInt(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseInt(maxPrice);
  }
  if (beds) where.bedrooms = { gte: parseInt(beds) };
  if (baths) where.bathrooms = { gte: parseInt(baths) };
  if (cars) where.carSpaces = { gte: parseInt(cars) };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { address: { contains: q } },
      { description: { contains: q } },
    ];
  }

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };

  let properties = await db.property.findMany({
    where,
    include: { suburb: true, agent: true },
    orderBy,
    ...(limit ? { take: limit } : {}),
  });

  if (suburbName) {
    properties = properties.filter(
      (p) => p.suburb.name.toLowerCase() === suburbName.toLowerCase()
    );
  }

  const result = properties.map((p) => ({
    ...p,
    images: parseJson<string[]>(p.images, []),
    features: p.features.split(",").map((f) => f.trim()).filter(Boolean),
  }));

  return NextResponse.json({ properties: result, total: result.length });
}
