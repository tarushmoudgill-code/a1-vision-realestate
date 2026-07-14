import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const PATCH = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const data: Record<string, unknown> = {};
  const fields = ["name","title","bio","photo","email","phone","yearsExperience","rating","activeListings","soldCount","totalSalesValue"];
  for (const f of fields) if (f in b) data[f] = b[f];
  if ("specialisations" in b) data.specialisations = Array.isArray(b.specialisations) ? (b.specialisations as string[]).join(",") : String(b.specialisations);
  if ("suburbs" in b) data.suburbs = Array.isArray(b.suburbs) ? (b.suburbs as string[]).join(",") : String(b.suburbs);
  if ("languages" in b) data.languages = Array.isArray(b.languages) ? (b.languages as string[]).join(",") : String(b.languages);
  const updated = await db.agent.update({ where: { id: ctx.params.id }, data });
  await audit(ctx.session.sub, "UPDATE", "agent", ctx.params.id, `Updated agent ${updated.name}`);
  return NextResponse.json({ agent: updated });
}, "agents");

export const DELETE = adminHandler(async (ctx) => {
  await db.agent.delete({ where: { id: ctx.params.id } });
  await audit(ctx.session.sub, "DELETE", "agent", ctx.params.id, "Deleted agent");
  return NextResponse.json({ ok: true });
}, "agents");
