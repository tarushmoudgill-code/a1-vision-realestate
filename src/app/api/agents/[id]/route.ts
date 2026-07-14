import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const active = await db.property.findMany({
    where: { agentId: id, status: { in: ["ACTIVE", "UNDER_OFFER"] } },
    orderBy: { createdAt: "desc" },
  });
  const sold = await db.property.findMany({
    where: { agentId: id, status: "SOLD" },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });
  const testimonials = await db.testimonial.findMany({
    where: { status: "APPROVED" },
    take: 4,
  });

  return NextResponse.json({
    agent: {
      ...agent,
      specialisations: agent.specialisations.split(",").map((s) => s.trim()).filter(Boolean),
      suburbs: agent.suburbs.split(",").map((s) => s.trim()).filter(Boolean),
      languages: agent.languages.split(",").map((s) => s.trim()).filter(Boolean),
    },
    active: active.map((p) => ({ ...p, images: parseJson<string[]>(p.images, []) })),
    sold: sold.map((p) => ({ ...p, images: parseJson<string[]>(p.images, []) })),
    testimonials,
  });
}
