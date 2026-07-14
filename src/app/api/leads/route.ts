import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Handles enquiries, appraisal requests, list-your-property submissions
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const type = String(body.type || "ENQUIRY").toUpperCase();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const message = String(body.message || "").trim();
  const propertyId = body.propertyId ? String(body.propertyId) : null;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 }
    );
  }

  const lead = await db.lead.create({
    data: {
      type,
      name,
      email,
      phone,
      message,
      propertyId,
      status: "NEW",
      source: "Website",
    },
  });
  return NextResponse.json({ ok: true, id: lead.id });
}
