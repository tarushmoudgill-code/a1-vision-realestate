import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const GET = adminHandler(async () => {
  const agents = await db.agent.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ agents });
}, "agents");

export const POST = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const created = await db.agent.create({
    data: {
      name: String(b.name || ""),
      title: String(b.title || ""),
      bio: String(b.bio || ""),
      photo: String(b.photo || ""),
      email: String(b.email || ""),
      phone: String(b.phone || ""),
      specialisations: Array.isArray(b.specialisations) ? (b.specialisations as string[]).join(",") : String(b.specialisations || ""),
      suburbs: Array.isArray(b.suburbs) ? (b.suburbs as string[]).join(",") : String(b.suburbs || ""),
      languages: Array.isArray(b.languages) ? (b.languages as string[]).join(",") : String(b.languages || "English"),
      yearsExperience: Number(b.yearsExperience) || 0,
      rating: Number(b.rating) || 5,
    },
  });
  await audit(ctx.session.sub, "CREATE", "agent", created.id, `Created agent ${created.name}`);
  return NextResponse.json({ agent: created });
}, "agents");
