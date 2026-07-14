import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const testimonials = await db.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ testimonials });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const location = String(body.location || "").trim();
  const message = String(body.message || "").trim();
  const rating = Number(body.rating) || 5;
  const serviceType = String(body.serviceType || "Sale").trim();

  if (!name || !message) {
    return NextResponse.json({ error: "Name and message are required." }, { status: 400 });
  }
  const t = await db.testimonial.create({
    data: { name, location, message, rating, serviceType, status: "PENDING" },
  });
  return NextResponse.json({ ok: true, id: t.id });
}
