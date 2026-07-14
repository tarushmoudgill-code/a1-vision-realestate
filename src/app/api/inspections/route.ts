import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const propertyId = String(body.propertyId || "").trim();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const preferredDate = String(body.preferredDate || "").trim();
  const preferredTime = String(body.preferredTime || "").trim();
  const message = String(body.message || "").trim();

  if (!propertyId || !name || !email || !preferredDate) {
    return NextResponse.json(
      { error: "Property, name, email and preferred date are required." },
      { status: 400 }
    );
  }

  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { id: true, agentId: true },
  });
  if (!property)
    return NextResponse.json({ error: "Property not found." }, { status: 404 });

  const inspection = await db.inspection.create({
    data: {
      propertyId,
      agentId: property.agentId,
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      message,
      status: "PENDING",
    },
  });
  return NextResponse.json({ ok: true, id: inspection.id });
}
